import { Request, Response, NextFunction } from 'express'
import { AppError } from '~/common/error/app-error'
import { ERROR_CODE } from '~/common/constant/error-code'
import { buildRequestHash } from '~/modules/payments/idempotency.service'

export const parseIdempotency = (scope: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.headers['idempotency-key'] as string

    if (!key || key.length > 255) {
      return next(new AppError(400, ERROR_CODE.BAD_REQUEST, 'Idempotency-Key header is required'))
    }

    const requestHash = buildRequestHash({
      method: req.method,
      path: req.originalUrl || req.path,
      body: req.body
    })

    // Gắn context vào request
    req.idempotency = {
      scope,
      key,
      requestHash
    }

    next()
  }
}
