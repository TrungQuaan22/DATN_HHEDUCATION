import { Request, Response, NextFunction } from 'express'
import { idempotencyRepository } from '~/modules/payments/repositories/idempotency.repository'
import { AppError } from '~/common/error/app-error'
import { ERROR_CODE } from '~/common/constant/error-code'
import { paymentConfig } from '~/modules/payments/config'

type BusinessHandler<T> = (req: Request) => Promise<{ statusCode: number; body: T }>

const addHours = (date: Date, hours: number) => {
  const next = new Date(date)
  next.setHours(next.getHours() + hours)
  return next
}

const isStale = (date: Date | null, now: Date) => {
  if (!date) return false

  const staleMs = paymentConfig.idempotencyStaleMinutes * 60 * 1000
  return now.getTime() - date.getTime() > staleMs
}

export const withIdempotency = <T>(handler: BusinessHandler<T>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const context = req.idempotency

    if (!context) {
      return next(
        new AppError(
          500,
          ERROR_CODE.INTERNAL_SERVER_ERROR,
          'Idempotency context is missing. Check middleware order.'
        )
      )
    }

    if (!req.user?.id) {
      return next(
        new AppError(
          401,
          ERROR_CODE.UNAUTHORIZED,
          'Authentication is required for idempotency.'
        )
      )
    }

    const { scope, key, requestHash } = context
    const userId = req.user.id
    const now = new Date()

    const created = await idempotencyRepository.tryCreateProcessingKey({
      scope,
      key,
      userId,
      requestHash,
      processingAt: now,
      expiresAt: addHours(now, paymentConfig.idempotencyTtlHours)
    })

    if (!created) {
      const existing = await idempotencyRepository.findByScopeAndKey({ scope, key })

      if (!existing) {
        return next(
          new AppError(
            409,
            ERROR_CODE.CONFLICT,
            'Idempotency key conflict'
          )
        )
      }

      if (existing.requestHash !== requestHash) {
        return next(
          new AppError(
            409,
            ERROR_CODE.CONFLICT,
            'Idempotency key was already used with a different request'
          )
        )
      }

      if (existing.statusCode !== null && existing.responseBody !== null) {
        return res.status(existing.statusCode).json(existing.responseBody)
      }

      const staleAnchor = existing.processingAt ?? existing.createdAt

      if (!isStale(staleAnchor, now)) {
        return next(
          new AppError(
            409,
            ERROR_CODE.CONFLICT,
            'Request with this idempotency key is still processing'
          )
        )
      }

      await idempotencyRepository.markProcessing({
        scope,
        key,
        processingAt: now
      })
    }

    let result: { statusCode: number; body: T }

    try {
      result = await handler(req)
    } catch (error) {
      await idempotencyRepository.deleteByScopeAndKey({ scope, key }).catch(() => undefined)
      return next(error)
    }

    try {
      await idempotencyRepository.saveResponse({
        scope,
        key,
        statusCode: result.statusCode,
        responseBody: result.body
      })
    } catch {
      return next(
        new AppError(
          500,
          ERROR_CODE.INTERNAL_SERVER_ERROR,
          'Failed to save idempotency response.'
        )
      )
    }

    return res.status(result.statusCode).json(result.body)
  }
}
