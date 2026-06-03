import type { NextFunction, Request, Response } from 'express'
import { TokenExpiredError } from 'jsonwebtoken'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { TokenType } from '~/common/constant/enums'
import { AppError } from '~/common/error/app-error'
import { jwtConfig } from '~/config/jwt_config'
import { verifyAccessToken, type AccessTokenPayload } from '~/modules/auth/utils'

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

// Verifies the short-lived access token without reading session state.
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

  req.user = {
    id: payload.userId,
    role: payload.role,
    sessionId: payload.sessionId
  }

  return next()
}
