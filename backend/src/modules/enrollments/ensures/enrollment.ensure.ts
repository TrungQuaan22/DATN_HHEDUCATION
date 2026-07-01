import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'

export const ensureCourseExistsForEnrollment = <T>(course: T | null): T => {
  if (!course) {
    throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
  }
  return course
}

export function ensureUserExists<T>(user: T | null): asserts user is T {
  if (!user) {
    throw new AppError(404, ERROR_CODE.USER_NOT_FOUND, 'User not found')
  }
}
