import type { UserRole } from '@prisma/client'

import type { RefreshTokenPayload } from '../utils'

export type LoginTokens = {
  sessionId: string
  accessToken: string
  refreshToken: string
  refreshTokenHash: string
  refreshTokenExpiresAt: Date
}

export type CreateLoginTokensInput = {
  userId: string
  role: UserRole
  sessionId?: string
}

export interface TokenServicePort {
  createLoginTokens(input: CreateLoginTokensInput): Promise<LoginTokens>
  verifyRefreshToken(refreshToken: string): Promise<RefreshTokenPayload>
}
