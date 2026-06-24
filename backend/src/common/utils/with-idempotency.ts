import type { NextFunction, Request, Response } from 'express'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'
import { idempotencyService } from '~/modules/payments/wiring'

type BusinessHandler<T> = (req: Request) => Promise<{ statusCode: number; body: T }>

type SuccessResponse<T> = {
  success: true
  data: T
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
        new AppError(401, ERROR_CODE.UNAUTHORIZED, 'Authentication is required for idempotency.')
      )
    }

    try {
      const result = await idempotencyService.run(
        {
          scope: context.scope,
          key: context.key,
          userId: req.user.id,
          requestHash: context.requestHash
        },
        async () => {
          const businessResult = await handler(req)
          const responseBody: SuccessResponse<T> = {
            success: true,
            data: businessResult.body
          }

          return {
            statusCode: businessResult.statusCode,
            body: responseBody
          }
        }
      )

      return res.status(result.statusCode).json(result.body)
    } catch (error) {
      return next(error)
    }
  }
}
