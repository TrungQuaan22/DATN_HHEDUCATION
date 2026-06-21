import { UserRole, UserStatus } from '@prisma/client'
import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'

export class User {
  readonly id: string
  readonly email: string
  readonly role: UserRole
  readonly status: UserStatus
  readonly passwordHash: string

  constructor(data: {
    id: string
    email: string
    role: UserRole
    status: UserStatus
    passwordHash: string
  }) {
    this.id = data.id
    this.email = data.email
    this.role = data.role
    this.status = data.status
    this.passwordHash = data.passwordHash
  }

  ensureCanLogin(): void {
    if (this.status === UserStatus.banned) {
      throw new AppError(403, ERROR_CODE.ACCOUNT_BANNED, ERROR_MESSAGE.ACCOUNT_BANNED)
    }

    if (this.status === UserStatus.pending_verification) {
      throw new AppError(403, ERROR_CODE.ACCOUNT_NOT_VERIFIED, ERROR_MESSAGE.ACCOUNT_NOT_VERIFIED)
    }
  }

  isBanned(): boolean {
    return this.status === UserStatus.banned
  }
}
