import { OrderStatus, PaymentStatus } from '@prisma/client'

export type PaymentMatchOrderRecord = {
  id: string
  totalAmount: number
  status: OrderStatus
  expiresAt: Date
  payments: Array<{
    id: string
    status: PaymentStatus
  }>
}

export type PaymentMatchEvent = {
  amount: number
  transactionRef: string
  orderInvoiceNumber: string | null
  gateway: string | null
  accountNumber: string | null
  paidAt: Date | null
}

export class PaymentMatch {
  readonly event: PaymentMatchEvent
  readonly order: PaymentMatchOrderRecord

  constructor(event: PaymentMatchEvent, order: PaymentMatchOrderRecord) {
    this.event = event
    this.order = order
  }

  get targetPayment() {
    return this.order.payments[0]
  }

  evaluateMatch(now: Date = new Date()): {
    status: 'success' | 'manual_review'
    reason: 'payment_not_pending' | 'under_paid' | 'late_success' | 'success'
  } {
    const payment = this.targetPayment

    if (!payment || payment.status !== PaymentStatus.pending) {
      return { status: 'manual_review', reason: 'payment_not_pending' }
    }

    if (this.event.amount < this.order.totalAmount) {
      return { status: 'manual_review', reason: 'under_paid' }
    }

    if (this.order.expiresAt.getTime() <= now.getTime() || this.order.status !== OrderStatus.pending) {
      return { status: 'manual_review', reason: 'late_success' }
    }

    return { status: 'success', reason: 'success' }
  }

  buildReviewMetadata(reason: string) {
    return {
      reviewReason: reason,
      expectedAmount: this.order.totalAmount,
      receivedAmount: this.event.amount,
      orderInvoiceNumber: this.event.orderInvoiceNumber,
      transactionRef: this.event.transactionRef,
      gateway: this.event.gateway,
      accountNumber: this.event.accountNumber,
      orderStatus: this.order.status,
      expiredAt: this.order.expiresAt
    }
  }

  buildSuccessMetadata() {
    return {
      expectedAmount: this.order.totalAmount,
      receivedAmount: this.event.amount,
      orderInvoiceNumber: this.event.orderInvoiceNumber,
      transactionRef: this.event.transactionRef,
      gateway: this.event.gateway,
      accountNumber: this.event.accountNumber
    }
  }
}
