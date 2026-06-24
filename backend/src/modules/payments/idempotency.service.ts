import { createHash } from 'crypto'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

import { paymentConfig } from './config'
import type { IdempotencyRepositoryPort } from './ports/idempotency-repository.port'
import type { IdempotencyPort, IdempotencyRunInput } from './ports/idempotency.port'

export const buildRequestHash = (data: { method: string; path: string; body: unknown }) => {
  return createHash('sha256')
    .update(
      JSON.stringify({
        method: data.method.toUpperCase(),
        path: data.path,
        body: data.body
      })
    )
    .digest('hex')
}

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

export class IdempotencyService implements IdempotencyPort {
  constructor(private readonly repository: IdempotencyRepositoryPort) {}

  async run<T>(
    input: IdempotencyRunInput,
    handler: () => Promise<{ statusCode: number; body: T }>
  ) {
    const now = new Date()
    const created = await this.repository.tryCreateProcessingKey({
      scope: input.scope,
      key: input.key,
      userId: input.userId,
      requestHash: input.requestHash,
      processingAt: now,
      expiresAt: addHours(now, paymentConfig.idempotencyTtlHours)
    })

    if (!created) {
      const existing = await this.repository.findByScopeKeyAndUser({
        scope: input.scope,
        key: input.key,
        userId: input.userId
      })

      if (!existing) {
        throw new AppError(409, ERROR_CODE.CONFLICT, 'Idempotency key already exists')
      }

      if (existing.requestHash !== input.requestHash) {
        throw new AppError(
          409,
          ERROR_CODE.CONFLICT,
          'Idempotency key was already used with a different request'
        )
      }

      if (existing.responseBody && existing.statusCode) {
        return {
          statusCode: existing.statusCode,
          body: existing.responseBody as T
        }
      }

      const staleAnchor = existing.processingAt ?? existing.createdAt

      if (!isStale(staleAnchor, now)) {
        throw new AppError(
          409,
          ERROR_CODE.CONFLICT,
          'Request with this idempotency key is still processing'
        )
      }

      const marked = await this.repository.markProcessing({
        scope: input.scope,
        key: input.key,
        userId: input.userId,
        processingAt: now,
        staleProcessingAt: existing.processingAt
      })

      if (!marked) {
        throw new AppError(
          409,
          ERROR_CODE.CONFLICT,
          'Request with this idempotency key is still processing'
        )
      }
    }

    let result: { statusCode: number; body: T }

    try {
      result = await handler()
    } catch (error) {
      await this.repository.deleteByScopeKeyAndUser({
        scope: input.scope,
        key: input.key,
        userId: input.userId
      })

      throw error
    }

    await this.repository.saveResponse({
      scope: input.scope,
      key: input.key,
      userId: input.userId,
      statusCode: result.statusCode,
      responseBody: result.body
    })

    return result
  }
}
