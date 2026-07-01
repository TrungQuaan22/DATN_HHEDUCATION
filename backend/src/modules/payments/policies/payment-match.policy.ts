import type { NormalizedPaymentEvent } from '../dto'
import type { PaymentWebhookOrderRecord } from '../ports/payment-webhook-repository.port'

export type PaymentMatchReason =
  | 'payment_not_pending'
  | 'under_paid'
  | 'late_success'
  | 'success'

export function getTargetPayment(order: PaymentWebhookOrderRecord) {
  return order.payments[0]
}

export function evaluatePaymentMatch(
  event: NormalizedPaymentEvent,
  order: PaymentWebhookOrderRecord,
  now: Date = new Date()
): { status: 'success' | 'manual_review'; reason: PaymentMatchReason } {
  const payment = getTargetPayment(order)

  if (!payment || payment.status !== 'pending') {
    return { status: 'manual_review', reason: 'payment_not_pending' }
  }

  if (event.amount < order.totalAmount) {
    return { status: 'manual_review', reason: 'under_paid' }
  }

  if (order.expiresAt.getTime() <= now.getTime() || order.status !== 'pending') {
    return { status: 'manual_review', reason: 'late_success' }
  }

  return { status: 'success', reason: 'success' }
}

export function buildPaymentReviewMetadata(
  event: NormalizedPaymentEvent,
  order: PaymentWebhookOrderRecord,
  reason: string
) {
  return {
    reviewReason: reason,
    expectedAmount: order.totalAmount,
    receivedAmount: event.amount,
    orderInvoiceNumber: event.orderInvoiceNumber,
    transactionRef: event.transactionRef,
    gateway: event.gateway,
    accountNumber: event.accountNumber,
    orderStatus: order.status,
    expiredAt: order.expiresAt
  }
}

export function buildPaymentSuccessMetadata(
  event: NormalizedPaymentEvent,
  order: PaymentWebhookOrderRecord
) {
  return {
    expectedAmount: order.totalAmount,
    receivedAmount: event.amount,
    orderInvoiceNumber: event.orderInvoiceNumber,
    transactionRef: event.transactionRef,
    gateway: event.gateway,
    accountNumber: event.accountNumber
  }
}
