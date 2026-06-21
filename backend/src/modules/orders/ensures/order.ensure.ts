import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

type PurchasableCourse = {
  id: string
}

export const ensureCoursesArePurchasable = (
  requestedCourseIds: string[],
  courses: PurchasableCourse[]
) => {
  if (courses.length !== requestedCourseIds.length) {
    throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, 'One or more courses were not found')
  }
}

export const ensureNotAlreadyEnrolled = (existingEnrollments: Array<{ courseId: string }>) => {
  if (existingEnrollments.length > 0) {
    throw new AppError(409, ERROR_CODE.CONFLICT, 'You are already enrolled in one or more courses')
  }
}

export const ensureOrderExists = <T>(order: T | null): T => {
  if (!order) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Order not found')
  }

  return order
}

export const ensureReloadedOrderExists = <T>(order: T | null): T => {
  if (!order) {
    throw new AppError(500, ERROR_CODE.INTERNAL_SERVER_ERROR, 'Order could not be reloaded')
  }

  return order
}
