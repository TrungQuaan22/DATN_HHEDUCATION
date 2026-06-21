import { UserStatus } from '@prisma/client'
import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { isWithinRefreshTokenRetryGrace } from '../utils'

export type AuthSessionData = {
  id: string
  userId: string
  refreshTokenHash: string
  previousRefreshTokenHash: string | null
  previousTokenRotatedAt: Date | null
  isRevoked: boolean
  expiresAt: Date
  user: {
    id: string
    status: UserStatus
  }
}

export class AuthSession {
  readonly id: string
  readonly userId: string
  readonly refreshTokenHash: string
  readonly previousRefreshTokenHash: string | null
  readonly previousTokenRotatedAt: Date | null
  readonly isRevoked: boolean
  readonly expiresAt: Date
  readonly userStatus: UserStatus

  constructor(data: AuthSessionData) {
    this.id = data.id
    this.userId = data.userId
    this.refreshTokenHash = data.refreshTokenHash
    this.previousRefreshTokenHash = data.previousRefreshTokenHash
    this.previousTokenRotatedAt = data.previousTokenRotatedAt
    this.isRevoked = data.isRevoked
    this.expiresAt = data.expiresAt
    this.userStatus = data.user.status
  }

  ensureValid(payloadUserId: string): void {
    if (this.userId !== payloadUserId) {
      throw new AppError(401, ERROR_CODE.INVALID_REFRESH_TOKEN, ERROR_MESSAGE.INVALID_REFRESH_TOKEN)
    }

    if (this.isRevoked || this.expiresAt <= new Date()) {
      throw new AppError(401, ERROR_CODE.INVALID_REFRESH_TOKEN, ERROR_MESSAGE.INVALID_REFRESH_TOKEN)
    }
  }

  isUserBanned(): boolean {
    return this.userStatus === UserStatus.banned
  }

  async verifyAndRotateToken(
    refreshToken: string,
    verifyHashFn: (password: string, hash: string) => Promise<boolean>
  ): Promise<{ mustRevokeSession: boolean }> {
    const isCurrentRefreshToken = await verifyHashFn(refreshToken, this.refreshTokenHash)

    if (isCurrentRefreshToken) {
      return { mustRevokeSession: false }
    }

    const isPreviousRefreshToken =
      this.previousRefreshTokenHash !== null &&
      (await verifyHashFn(refreshToken, this.previousRefreshTokenHash))

    if (!isPreviousRefreshToken) {
      throw new AppError(
        401,
        ERROR_CODE.INVALID_REFRESH_TOKEN,
        ERROR_MESSAGE.INVALID_REFRESH_TOKEN
      )
    }

    if (!isWithinRefreshTokenRetryGrace(this.previousTokenRotatedAt)) {
      return { mustRevokeSession: true }
    }

    return { mustRevokeSession: false }
  }
}
