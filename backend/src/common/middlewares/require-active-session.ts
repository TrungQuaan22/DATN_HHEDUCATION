import type { NextFunction, Request, Response } from 'express'
import { UserStatus } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { authRepository } from '~/modules/auth/repository'

// Checks DB-backed session state for sensitive routes that must honor revoke/ban immediately.
export const requireActiveSession = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError(401, ERROR_CODE.UNAUTHORIZED, ERROR_MESSAGE.UNAUTHORIZED))
  }

  const session = await authRepository.findSessionById(req.user.sessionId)

  if (!session || session.userId !== req.user.id) {
    return next(
      new AppError(401, ERROR_CODE.INVALID_ACCESS_TOKEN, ERROR_MESSAGE.INVALID_ACCESS_TOKEN)
    )
  }

  if (session.isRevoked || session.expiresAt <= new Date()) {
    return next(
      new AppError(401, ERROR_CODE.INVALID_ACCESS_TOKEN, ERROR_MESSAGE.INVALID_ACCESS_TOKEN)
    )
  }

  if (session.user.status === UserStatus.banned) {
    return next(new AppError(403, ERROR_CODE.ACCOUNT_BANNED, ERROR_MESSAGE.ACCOUNT_BANNED))
  }

  if (session.user.status === UserStatus.pending_verification) {
    return next(
      new AppError(403, ERROR_CODE.ACCOUNT_NOT_VERIFIED, ERROR_MESSAGE.ACCOUNT_NOT_VERIFIED)
    )
  }

  req.user = {
    id: session.user.id,
    role: session.user.role,
    sessionId: session.id
  }

  return next()
}
