import type { OrderStatus, PaymentStatus } from '@prisma/client'

export type { OrderStatus, PaymentStatus }

export type OrderItemRecord = {
  id: string
  courseId: string
  priceAtPurchase: number
  course: {
    title: string
    slug: string
  }
}

export type OrderPaymentRecord = {
  id: string
  provider: string
  amount: number
  currency: string
  status: PaymentStatus
  qrCodeUrl: string | null
  checkoutUrl: string | null
  expiresAt: Date | null
  paidAt: Date | null
}

export type OrderRecord = {
  id: string
  orderInvoiceNumber: string
  totalAmount: number
  currency: string
  status: OrderStatus
  expiresAt: Date
  createdAt: Date
  items: OrderItemRecord[]
  payments: OrderPaymentRecord[]
}

export type PurchasableCourseRecord = {
  id: string
  price: number
  salePrice: number | null
}

export type ExistingEnrollmentRecord = {
  courseId: string
}

export type PaymentAttemptRecord = {
  id: string
  provider: string
  status: PaymentStatus
}

export type OrderActionRecord = {
  id: string
  orderInvoiceNumber: string
  totalAmount: number
  status: OrderStatus
  expiresAt: Date
  payments: PaymentAttemptRecord[]
}

export type CreateOrderRecord = {
  userId: string
  orderInvoiceNumber: string
  totalAmount: number
  currency: string
  status: OrderStatus
  expiresAt: Date
  courses: PurchasableCourseRecord[]
}

export type CreatePaymentRecord = {
  orderId: string
  provider: string
  providerPaymentId: string
  amount: number
  qrCodeUrl: string | null
  checkoutUrl: string | null
  expiresAt: Date
}

export interface OrderRepositoryPort {
  lockOrderForUser(data: { userId: string; orderId: string }): Promise<void>

  expireStalePendingOrders(data: { now: Date; userId?: string; orderId?: string }): Promise<void>

  findActivePendingOrder(userId: string, now: Date): Promise<OrderRecord | null>

  findPublishedCourses(courseIds: string[]): Promise<PurchasableCourseRecord[]>

  findExistingEnrollments(data: {
    userId: string
    courseIds: string[]
  }): Promise<ExistingEnrollmentRecord[]>

  createUniqueInvoiceNumber(): Promise<string>

  createOrder(data: CreateOrderRecord): Promise<{ id: string }>

  completeFreeOrder(data: { orderId: string; userId: string; courseIds: string[] }): Promise<void>

  findOrderById(orderId: string): Promise<OrderRecord | null>

  findOrderForUser(orderId: string, userId: string): Promise<OrderRecord | null>

  findOrderForPaymentAttempt(data: {
    userId: string
    orderId: string
  }): Promise<OrderActionRecord | null>

  cancelPendingPayments(orderId: string): Promise<void>

  createPaymentForOrder(data: CreatePaymentRecord): Promise<void>

  findOrderForCancel(data: { userId: string; orderId: string }): Promise<OrderActionRecord | null>

  cancelOrderAndPendingPayments(orderId: string): Promise<void>
}
