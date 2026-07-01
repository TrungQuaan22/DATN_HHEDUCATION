import type { PaymentTransactionMatchStatus, WebhookStatus } from '@prisma/client'

import type { OrderStatus, PaymentStatus } from '~/modules/orders/ports/order-repository.port'

export type { PaymentTransactionMatchStatus, WebhookStatus }

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

export type CreateWebhookEventData = {
  provider: string
  eventId: string
  payload: unknown
}

export type UpdateWebhookEventStatusData = {
  provider: string
  eventId: string
  status: WebhookStatus
  errorMessage?: string | null
  processedAt?: Date
}

export type UpdatePaymentTransactionData = {
  id: string
  orderId?: string
  paymentId?: string
  matchStatus: PaymentTransactionMatchStatus
  metadata?: unknown
}

export type CreateManualReviewPaymentData = {
  event: NormalizedPaymentEvent
  reason: string
  orderId: string
  expectedAmount?: number
  orderStatus?: OrderStatus
  expiredAt?: Date
}

export type UpdatePendingPaymentData = {
  status: PaymentStatus
  amount?: number
  transactionRef?: string | null
  paidAt?: Date | null
  metadata?: unknown
}

export interface PaymentWebhookTransactionPort {
  createWebhookEvent(data: CreateWebhookEventData): Promise<unknown>
  updateWebhookEventStatus(data: UpdateWebhookEventStatusData): Promise<unknown>
  createPaymentTransaction(event: NormalizedPaymentEvent): Promise<{ id: string }>
  updatePaymentTransaction(data: UpdatePaymentTransactionData): Promise<unknown>
  createManualReviewPayment(data: CreateManualReviewPaymentData): Promise<{ id: string }>
  updatePayment(paymentId: string, data: UpdatePendingPaymentData): Promise<boolean>
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
  withTransaction<T>(
    handler: (transaction: PaymentWebhookTransactionPort) => Promise<T>
  ): Promise<T>
  findWebhookEvent(provider: string, eventId: string): Promise<{ status: WebhookStatus } | null>
  isUniqueConstraintError(error: unknown): boolean
}
