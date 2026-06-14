export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'expired'

export type PaymentStatus =
  | 'pending'
  | 'success'
  | 'failed'
  | 'cancelled'
  | 'late_success'
  | 'manual_review'


export type OrderRecord = {
  id: string
  orderInvoiceNumber: string
  totalAmount: number
  currency: string
  status: OrderStatus
  expiresAt: Date
  createdAt: Date
  items: Array<{
    id: string
    courseId: string
    priceAtPurchase: number
    course: {
      title: string
      slug: string
    }
  }>
  payments: Array<{
    id: string
    provider: string
    amount: number
    currency: string
    status: PaymentStatus
    qrCodeUrl: string | null
    checkoutUrl: string | null
    expiresAt: Date | null
    paidAt: Date | null
  }>
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

export type PaymentAttemptOrderRecord = {
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

export interface OrderRepositoryPort {
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
  }): Promise<PaymentAttemptOrderRecord | null>

  cancelPendingPayments(orderId: string): Promise<void>

  createPaymentForOrder(data: {
    orderId: string
    provider: string
    providerPaymentId: string
    amount: number
    qrCodeUrl: string | null
    checkoutUrl: string | null
    expiresAt: Date
  }): Promise<void>

  findOrderForCancel(data: {
    userId: string
    orderId: string
  }): Promise<{ id: string; status: OrderStatus } | null>

  cancelOrderAndPendingPayments(orderId: string): Promise<void>
}
