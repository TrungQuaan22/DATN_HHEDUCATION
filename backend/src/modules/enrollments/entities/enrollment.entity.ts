import { UserRole, UserStatus } from '@prisma/client'
import { AppError } from '~/common/error/app-error'
import { ERROR_CODE } from '~/common/constant/error-code'

export class Enrollment {
  readonly id?: string
  readonly userId: string
  readonly courseId: string
  readonly source: string
  readonly enrolledAt?: Date

  constructor(data: {
    id?: string
    userId: string
    courseId: string
    source: string
    enrolledAt?: Date
  }) {
    this.id = data.id
    this.userId = data.userId
    this.courseId = data.courseId
    this.source = data.source
    this.enrolledAt = data.enrolledAt
  }

  // --- Domain constraints & validations ---

  static validateUserForEnrollment(user: { role: UserRole; status: UserStatus } | null): void {
    if (!user) {
      throw new AppError(404, ERROR_CODE.USER_NOT_FOUND, 'User not found')
    }

    if (user.role !== UserRole.student || user.status !== UserStatus.active) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'User must be an active student')
    }
  }

  public isManual(): boolean {
    return this.source === 'manual'
  }
}
