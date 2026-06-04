import type { OrderStatus, PaymentStatus } from '@prisma/client'

import type { OrderRow } from '../mappers/order.mapper'

export type PurchasableCourseRecord = {
  id: string
  price: number
  salePrice: number | null
}

export type ExistingEnrollmentRecord = {
  courseId: string
}

export type PaymentAttemptOrderRecord = {
  id: string
  orderInvoiceNumber: string
  totalAmount: number
  currency: string
  status: OrderStatus
  expiresAt: Date
  payments: Array<{
    id: string
    provider: string
    status: PaymentStatus
  }>
}

export interface OrderTransactionPort {
  expireStalePendingOrders(data: {
    now: Date
    userId?: string
    orderId?: string
  }): Promise<unknown>
  findActivePendingOrder(userId: string, now: Date): Promise<OrderRow | null>
  getPublishedCourses(courseIds: string[]): Promise<PurchasableCourseRecord[]>
  getExistingEnrollments(data: {
    userId: string
    courseIds: string[]
  }): Promise<ExistingEnrollmentRecord[]>
  createUniqueInvoiceNumber(): Promise<string>
  createOrder(data: {
    userId: string
    orderInvoiceNumber: string
    totalAmount: number
    currency: string
    status: OrderStatus
    expiresAt: Date
    courses: PurchasableCourseRecord[]
  }): Promise<{ id: string }>
  completeFreeOrder(data: {
    orderId: string
    userId: string
    courseIds: string[]
  }): Promise<void>
  getOrderById(orderId: string): Promise<OrderRow | null>
  findOrderForPaymentAttempt(data: {
    userId: string
    orderId: string
  }): Promise<PaymentAttemptOrderRecord | null>
  cancelPendingPayments(orderId: string): Promise<unknown>
  createPaymentForOrder(data: {
    orderId: string
    orderInvoiceNumber: string
    totalAmount: number
    expiresAt: Date
    providerName: string
  }): Promise<void>
  findOrderForCancel(data: {
    userId: string
    orderId: string
  }): Promise<{ id: string; status: OrderStatus } | null>
  cancelOrderAndPendingPayments(orderId: string): Promise<void>
}

export interface OrderRepositoryPort {
  withTransaction<T>(handler: (transaction: OrderTransactionPort) => Promise<T>): Promise<T>
  expireStalePendingOrders(data: {
    now: Date
    userId?: string
    orderId?: string
  }): Promise<unknown>
  getOrderForUser(orderId: string, userId: string): Promise<OrderRow | null>
}
