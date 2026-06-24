import type { PaymentStatus } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

import type {
  ExistingEnrollmentRecord,
  OrderActionRecord,
  PaymentAttemptRecord,
  PurchasableCourseRecord
} from '../ports/order-repository.port'

export function validateCoursesPurchasable(
  requestedCourseIds: string[],
  courses: PurchasableCourseRecord[]
): void {
  if (courses.length !== requestedCourseIds.length) {
    throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, 'One or more courses were not found')
  }
}

export function validateNotEnrolled(enrollments: ExistingEnrollmentRecord[]): void {
  if (enrollments.length > 0) {
    throw new AppError(409, ERROR_CODE.CONFLICT, 'You are already enrolled in one or more courses')
  }
}

export function calculateOrderTotal(courses: PurchasableCourseRecord[]): number {
  return courses.reduce((total, course) => total + (course.salePrice ?? course.price), 0)
}

export function calculateOrderExpiration(createdAt: Date, pendingMinutes: number): Date {
  const expiresAt = new Date(createdAt)
  expiresAt.setMinutes(expiresAt.getMinutes() + pendingMinutes)
  return expiresAt
}

export function isFreeOrder(totalAmount: number): boolean {
  return totalAmount === 0
}

const blocksPaymentRetry = (status: PaymentStatus): boolean => {
  return status === 'success' || status === 'manual_review' || status === 'late_success'
}

export function validatePaymentAttempt(order: OrderActionRecord, now: Date): void {
  const expired =
    order.status === 'expired' ||
    (order.status === 'pending' && order.expiresAt.getTime() <= now.getTime())

  if (expired) {
    throw new AppError(409, ERROR_CODE.CONFLICT, 'Order has expired')
  }

  if (order.totalAmount <= 0 || order.status !== 'pending') {
    throw new AppError(409, ERROR_CODE.CONFLICT, 'Order is not payable')
  }

  if (order.payments.some((payment) => blocksPaymentRetry(payment.status))) {
    throw new AppError(
      409,
      ERROR_CODE.CONFLICT,
      'Order already has a payment that cannot be retried automatically'
    )
  }
}

export function findPendingPayment(
  payments: PaymentAttemptRecord[]
): PaymentAttemptRecord | undefined {
  return payments.find((payment) => payment.status === 'pending')
}

export function validateOrderCanBeCancelled(order: OrderActionRecord): void {
  if (order.status !== 'pending') {
    throw new AppError(409, ERROR_CODE.CONFLICT, 'Only pending orders can be cancelled')
  }
}
