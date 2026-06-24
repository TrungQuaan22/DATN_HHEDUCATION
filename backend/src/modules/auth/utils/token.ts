import { randomUUID } from 'crypto'

import type { UserRole } from '@prisma/client'

import { TokenType } from '~/common/constant/enums'
import { jwtConfig } from '~/config/jwt_config'

import { signAccessToken, signRefreshToken } from './jwt'
import { hashToken } from './password'

type CreateLoginTokensInput = {
  userId: string
  role: UserRole
  sessionId?: string
}

export type LoginTokens = {
  sessionId: string
  accessToken: string
  refreshToken: string
  refreshTokenHash: string
  refreshTokenExpiresAt: Date
}

const parseExpiresInDays = (expiresIn: unknown): number => {
  const matched = String(expiresIn).match(/^(\d+)d$/)

  if (!matched) {
    throw new Error('JWT_REFRESH_EXPIRES_IN must use day format, for example 7d')
  }

  return Number(matched[1])
}

export const createRefreshTokenExpiresAt = (): Date => {
  const expiresAt = new Date()
  const days = parseExpiresInDays(jwtConfig.refreshToken.expiresIn)
  expiresAt.setDate(expiresAt.getDate() + days)
  return expiresAt
}

export const createLoginTokens = async ({
  userId,
  role,
  sessionId = randomUUID()
}: CreateLoginTokensInput): Promise<LoginTokens> => {
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({
      payload: { tokenType: TokenType.ACCESS, userId, role, sessionId },
      privateKey: jwtConfig.accessToken.privateKey,
      options: { expiresIn: jwtConfig.accessToken.expiresIn }
    }),
    signRefreshToken({
      payload: { tokenType: TokenType.REFRESH, userId, sessionId },
      privateKey: jwtConfig.refreshToken.privateKey,
      options: { expiresIn: jwtConfig.refreshToken.expiresIn }
    })
  ])
  const refreshTokenHash = await hashToken(refreshToken)

  return {
    sessionId,
    accessToken,
    refreshToken,
    refreshTokenHash,
    refreshTokenExpiresAt: createRefreshTokenExpiresAt()
  }
}
