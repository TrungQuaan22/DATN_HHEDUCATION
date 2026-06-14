import type { OrderStatus, PaymentStatus } from '~/modules/orders/ports/order-repository.port'

export type WebhookStatus = 'received' | 'processing' | 'processed' | 'failed'
export type PaymentTransactionMatchStatus = 'matched' | 'unmatched' | 'manual_review' | 'ignored'


import type { NormalizedPaymentEvent } from '../dto'

export type PaymentWebhookOrderRecord = {
  id: string
  userId: string
  totalAmount: number
  currency: string
  status: OrderStatus
  expiresAt: Date
  items: Array<{
    courseId: string
  }>
  payments: Array<{
    id: string
    status: PaymentStatus
  }>
}

export interface PaymentWebhookTransactionPort {
  createWebhookEvent(data: {
    provider: string
    eventId: string
    payload: unknown
  }): Promise<unknown>
  updateWebhookEventStatus(data: {
    provider: string
    eventId: string
    status: WebhookStatus
    errorMessage?: string | null
    processedAt?: Date
  }): Promise<unknown>
  createPaymentTransaction(event: NormalizedPaymentEvent): Promise<{ id: string }>
  updatePaymentTransaction(data: {
    id: string
    orderId?: string
    paymentId?: string
    matchStatus: PaymentTransactionMatchStatus
    metadata?: unknown
  }): Promise<unknown>
  createManualReviewPayment(data: {
    event: NormalizedPaymentEvent
    reason: string
    orderId: string
    expectedAmount?: number
    orderStatus?: OrderStatus
    expiredAt?: Date
  }): Promise<{ id: string }>
  updatePayment(
    paymentId: string,
    data: {
      status: PaymentStatus
      amount?: number
      transactionRef?: string | null
      paidAt?: Date | null
      metadata?: unknown
    }
  ): Promise<unknown>
  findOrderForWebhook(
    orderInvoiceNumber: string,
    provider: string
  ): Promise<PaymentWebhookOrderRecord | null>
  completeOrderWithPayment(data: {
    orderId: string
    userId: string
    courseIds: string[]
  }): Promise<void>
}

export interface PaymentWebhookRepositoryPort {
  withTransaction<T>(handler: (transaction: PaymentWebhookTransactionPort) => Promise<T>): Promise<T>
  findWebhookEvent(
    provider: string,
    eventId: string
  ): Promise<{ status: WebhookStatus } | null>
  isUniqueConstraintError(error: unknown): boolean
}
