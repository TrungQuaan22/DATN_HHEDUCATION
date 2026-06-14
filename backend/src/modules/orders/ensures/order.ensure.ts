import type { OrderStatus } from '@prisma/client'

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

export const ensureOrderIsPayable = (order: { totalAmount: number; status: OrderStatus }): void => {
  if (order.totalAmount === 0 || order.status !== 'pending') {
    throw new AppError(409, ERROR_CODE.CONFLICT, 'Order is not payable')
  }
}

export const ensureOrderHasNotExpired = (expiresAt: Date, now: Date): void => {
  if (expiresAt <= now) {
    throw new AppError(409, ERROR_CODE.CONFLICT, 'Order has expired')
  }
}

export const ensurePaymentCanBeRetried = (blockingPayment: { id: string } | undefined): void => {
  if (blockingPayment) {
    throw new AppError(
      409,
      ERROR_CODE.CONFLICT,
      'Order already has a payment that cannot be retried automatically'
    )
  }
}

export const ensureOrderCanBeCancelled = (status: OrderStatus): void => {
  if (status !== 'pending') {
    throw new AppError(409, ERROR_CODE.CONFLICT, 'Only pending orders can be cancelled')
  }
}
