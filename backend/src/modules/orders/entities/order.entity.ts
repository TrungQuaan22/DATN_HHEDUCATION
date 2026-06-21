import type { OrderRecord, OrderStatus, PaymentAttemptRecord } from '../ports/order-repository.port'

export class Order {
  readonly id: string
  readonly orderInvoiceNumber: string
  readonly totalAmount: number
  readonly currency: string
  readonly status: OrderStatus
  readonly expiresAt: Date
  readonly createdAt: Date
  readonly items: OrderRecord['items']
  readonly payments: OrderRecord['payments']

  constructor(record: OrderRecord) {
    this.id = record.id
    this.orderInvoiceNumber = record.orderInvoiceNumber
    this.totalAmount = record.totalAmount
    this.currency = record.currency
    this.status = record.status
    this.expiresAt = record.expiresAt
    this.createdAt = record.createdAt
    this.items = record.items
    this.payments = record.payments
  }

  // --- Core Calculations (Pure Logic) ---

  static calculateTotalAmount(courses: Array<{ price: number; salePrice: number | null }>): number {
    return courses.reduce((sum, course) => sum + (course.salePrice ?? course.price), 0)
  }

  static calculateExpiration(createdAt: Date, pendingMinutes: number): Date {
    const expiresAt = new Date(createdAt)
    expiresAt.setMinutes(expiresAt.getMinutes() + pendingMinutes)
    return expiresAt
  }

  get isFree(): boolean {
    return this.totalAmount === 0
  }

  // --- Self-Contained Domain Verifications ---

  isExpired(now: Date): boolean {
    return this.expiresAt.getTime() <= now.getTime()
  }

  canBeCancelled(): boolean {
    return this.status === 'pending'
  }

  isPayable(): boolean {
    return this.totalAmount > 0 && this.status === 'pending'
  }

  findBlockingPayment(): PaymentAttemptRecord | undefined {
    return this.payments.find(
      (payment) =>
        payment.status === 'success' ||
        payment.status === 'manual_review' ||
        payment.status === 'late_success'
    )
  }

  findPendingPayment(): PaymentAttemptRecord | undefined {
    return this.payments.find((payment) => payment.status === 'pending')
  }

  canPaymentBeRetried(): boolean {
    const blocking = this.findBlockingPayment()
    return blocking === undefined
  }
}
