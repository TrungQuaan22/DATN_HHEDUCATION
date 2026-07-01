import type { UserStatus } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'

import type { AuthSessionWithUserRecord } from '../ports/auth-repository.port'

export function validateUserCanLogin(status: UserStatus): void {
  if (status === 'active') {
    return
  }

  if (status === 'banned') {
    throw new AppError(403, ERROR_CODE.ACCOUNT_BANNED, ERROR_MESSAGE.ACCOUNT_BANNED)
  }

  throw new AppError(403, ERROR_CODE.ACCOUNT_NOT_VERIFIED, ERROR_MESSAGE.ACCOUNT_NOT_VERIFIED)
}

export function validateRefreshSession(
  session: AuthSessionWithUserRecord,
  userId: string,
  now: Date
): void {
  const isValid = session.userId === userId && !session.isRevoked && session.expiresAt > now

  if (!isValid) {
    throw new AppError(401, ERROR_CODE.INVALID_REFRESH_TOKEN, ERROR_MESSAGE.INVALID_REFRESH_TOKEN)
  }
}
