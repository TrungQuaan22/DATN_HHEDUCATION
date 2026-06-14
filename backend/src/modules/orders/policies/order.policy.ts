import { PaymentStatus } from '@prisma/client'

import type { PaymentAttemptRecord, PurchasableCourseRecord } from '../ports/order-repository.port'

export const calculateOrderTotalAmount = (courses: PurchasableCourseRecord[]): number => {
  return courses.reduce((totalAmount, course) => {
    const purchasePrice = course.salePrice ?? course.price

    return totalAmount + purchasePrice
  }, 0)
}

export const calculateOrderExpiration = (createdAt: Date, pendingMinutes: number): Date => {
  const expiresAt = new Date(createdAt)
  expiresAt.setMinutes(expiresAt.getMinutes() + pendingMinutes)

  return expiresAt
}

export const isFreeOrder = (totalAmount: number): boolean => {
  return totalAmount === 0
}

export const findBlockingPayment = (
  payments: PaymentAttemptRecord[]
): PaymentAttemptRecord | undefined => {
  return payments.find((payment) => {
    return (
      payment.status === PaymentStatus.success ||
      payment.status === PaymentStatus.manual_review ||
      payment.status === PaymentStatus.late_success
    )
  })
}

export const findPendingPayment = (
  payments: PaymentAttemptRecord[]
): PaymentAttemptRecord | undefined => {
  return payments.find((payment) => {
    return payment.status === PaymentStatus.pending
  })
}
