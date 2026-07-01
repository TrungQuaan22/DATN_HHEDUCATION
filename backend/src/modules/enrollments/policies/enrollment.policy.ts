import type { UserRole, UserStatus } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

export function validateUserCanEnroll(user: { role: UserRole; status: UserStatus }): void {
  if (user.role !== 'student' || user.status !== 'active') {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'User must be an active student')
  }
}

export function validateEnrollmentDoesNotExist(existingEnrollment: unknown | null): void {
  if (existingEnrollment) {
    throw new AppError(409, ERROR_CODE.CONFLICT, 'User is already enrolled in this course')
  }
}
