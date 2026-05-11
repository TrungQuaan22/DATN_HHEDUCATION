import type { NextFunction, Request, Response } from 'express'
import { UserStatus } from '@prisma/client'
import { TokenExpiredError } from 'jsonwebtoken'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { TokenType } from '~/common/constant/enums'
import { AppError } from '~/common/error/app-error'
import { jwtConfig } from '~/config/jwt_config'
import { authRepository } from '~/modules/auth/repository'
import { verifyAccessToken, type AccessTokenPayload } from '~/modules/auth/utils/jwt'

const getBearerToken = (authorizationHeader: string | undefined): string | null => {
  if (!authorizationHeader) {
    return null
  }

  const [scheme, token] = authorizationHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return null
  }

  return token
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = getBearerToken(req.headers.authorization)

  if (!accessToken) {
    return next(new AppError(401, ERROR_CODE.UNAUTHORIZED, ERROR_MESSAGE.UNAUTHORIZED))
  }

  let payload: AccessTokenPayload

  try {
    payload = await verifyAccessToken({
      token: accessToken,
      privateKey: jwtConfig.accessToken.privateKey
    })
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(
        new AppError(401, ERROR_CODE.ACCESS_TOKEN_EXPIRED, ERROR_MESSAGE.ACCESS_TOKEN_EXPIRED)
      )
    }

    return next(
      new AppError(401, ERROR_CODE.INVALID_ACCESS_TOKEN, ERROR_MESSAGE.INVALID_ACCESS_TOKEN)
    )
  }

  if (payload.tokenType !== TokenType.ACCESS) {
    return next(
      new AppError(401, ERROR_CODE.INVALID_ACCESS_TOKEN, ERROR_MESSAGE.INVALID_ACCESS_TOKEN)
    )
  }

  const session = await authRepository.findSessionById(payload.sessionId)

  if (!session || session.userId !== payload.userId) {
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
