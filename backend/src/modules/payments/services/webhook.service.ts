import {
  OrderStatus,
  PaymentStatus,
  PaymentTransactionMatchStatus,
} from '@prisma/client'

import type { NormalizedPaymentEvent } from '../dto'
import { paymentWebhookRepository } from '../repositories/payment-webhook.repository'
import type {
  PaymentWebhookOrderRecord,
  PaymentWebhookRepositoryPort,
  PaymentWebhookTransactionPort
} from '../ports/payment-webhook-repository.port'
import { PaymentMatch } from '../entities/payment-match.entity'

const buildReviewMetadata = (
  event: NormalizedPaymentEvent,
  data: {
    reason: string
    expectedAmount?: number
    orderStatus?: OrderStatus
    expiredAt?: Date
  }
) => {
  return {
    reviewReason: data.reason,
    expectedAmount: data.expectedAmount,
    receivedAmount: event.amount,
    orderInvoiceNumber: event.orderInvoiceNumber,
    transactionRef: event.transactionRef,
    gateway: event.gateway,
    accountNumber: event.accountNumber,
    orderStatus: data.orderStatus,
    expiredAt: data.expiredAt
  }
}

const finalizeSuccessfulPayment = async (
  transaction: PaymentWebhookTransactionPort,
  data: {
    event: NormalizedPaymentEvent
    order: PaymentWebhookOrderRecord
    paymentTransactionId: string
  }
) => {
  const match = new PaymentMatch(data.event, data.order)
  const evaluation = match.evaluateMatch()
  const payment = match.targetPayment

  if (evaluation.status === 'manual_review') {
    if (evaluation.reason === 'payment_not_pending') {
      const reviewPayment = await transaction.createManualReviewPayment({
        event: data.event,
        reason: 'payment_not_pending',
        orderId: data.order.id,
        expectedAmount: data.order.totalAmount,
        orderStatus: data.order.status,
        expiredAt: data.order.expiresAt
      })

      await transaction.updatePaymentTransaction({
        id: data.paymentTransactionId,
        orderId: data.order.id,
        paymentId: reviewPayment.id,
        matchStatus: PaymentTransactionMatchStatus.manual_review,
        metadata: match.buildReviewMetadata('payment_not_pending')
      })
      return
    }

    if (evaluation.reason === 'under_paid') {
      const metadata = match.buildReviewMetadata('under_paid')

      await transaction.updatePayment(payment.id, {
        status: PaymentStatus.manual_review,
        transactionRef: data.event.transactionRef,
        paidAt: data.event.paidAt,
        metadata
      })

      await transaction.updatePaymentTransaction({
        id: data.paymentTransactionId,
        orderId: data.order.id,
        paymentId: payment.id,
        matchStatus: PaymentTransactionMatchStatus.manual_review,
        metadata
      })
      return
    }

    if (evaluation.reason === 'late_success') {
      const metadata = match.buildReviewMetadata('late_success')

      await transaction.updatePayment(payment.id, {
        status: PaymentStatus.late_success,
        transactionRef: data.event.transactionRef,
        paidAt: data.event.paidAt,
        metadata
      })

      await transaction.updatePaymentTransaction({
        id: data.paymentTransactionId,
        orderId: data.order.id,
        paymentId: payment.id,
        matchStatus: PaymentTransactionMatchStatus.manual_review,
        metadata
      })
      return
    }
  }

  const metadata = match.buildSuccessMetadata()

  await transaction.updatePayment(payment.id, {
    status: PaymentStatus.success,
    amount: data.event.amount,
    transactionRef: data.event.transactionRef,
    paidAt: data.event.paidAt ?? new Date(),
    metadata
  })

  await transaction.updatePaymentTransaction({
    id: data.paymentTransactionId,
    orderId: data.order.id,
    paymentId: payment.id,
    matchStatus: PaymentTransactionMatchStatus.matched,
    metadata
  })

  await transaction.completeOrderWithPayment({
    orderId: data.order.id,
    userId: data.order.userId,
    courseIds: data.order.items.map((item) => item.courseId)
  })
}

export class WebhookService {
  constructor(private readonly webhookRepository: PaymentWebhookRepositoryPort) {}

  async processPaymentEvent(event: NormalizedPaymentEvent) {
    try {
      await this.webhookRepository.withTransaction(async (transaction) => {
        await transaction.createWebhookEvent({
          provider: event.provider,
          eventId: event.eventId,
          payload: event.rawPayload
        })

        const paymentTransaction = await transaction.createPaymentTransaction(event)

        if (event.status !== 'success' || event.direction !== 'in') {
          await transaction.updatePaymentTransaction({
            id: paymentTransaction.id,
            matchStatus: PaymentTransactionMatchStatus.ignored,
            metadata: buildReviewMetadata(event, {
              reason: event.direction === 'in' ? 'payment_not_success' : 'not_money_in'
            })
          })

          await transaction.updateWebhookEventStatus({
            provider: event.provider,
            eventId: event.eventId,
            status: 'processed',
            processedAt: new Date()
          })
          return
        }

        if (!event.orderInvoiceNumber) {
          await transaction.updatePaymentTransaction({
            id: paymentTransaction.id,
            matchStatus: PaymentTransactionMatchStatus.unmatched,
            metadata: buildReviewMetadata(event, {
              reason: 'missing_invoice_number'
            })
          })

          await transaction.updateWebhookEventStatus({
            provider: event.provider,
            eventId: event.eventId,
            status: 'processed',
            errorMessage: 'manual_review:missing_invoice_number',
            processedAt: new Date()
          })
          return
        }

        const order = await transaction.findOrderForWebhook(
          event.orderInvoiceNumber,
          event.provider
        )

        if (!order) {
          await transaction.updatePaymentTransaction({
            id: paymentTransaction.id,
            matchStatus: PaymentTransactionMatchStatus.unmatched,
            metadata: buildReviewMetadata(event, {
              reason: 'unknown_order'
            })
          })

          await transaction.updateWebhookEventStatus({
            provider: event.provider,
            eventId: event.eventId,
            status: 'processed',
            errorMessage: 'manual_review:unknown_order',
            processedAt: new Date()
          })
          return
        }

        if (order.currency !== event.currency) {
          const reviewPayment = await transaction.createManualReviewPayment({
            event,
            reason: 'currency_mismatch',
            orderId: order.id,
            expectedAmount: order.totalAmount
          })

          await transaction.updatePaymentTransaction({
            id: paymentTransaction.id,
            orderId: order.id,
            paymentId: reviewPayment.id,
            matchStatus: PaymentTransactionMatchStatus.manual_review,
            metadata: buildReviewMetadata(event, {
              reason: 'currency_mismatch',
              expectedAmount: order.totalAmount,
              orderStatus: order.status,
              expiredAt: order.expiresAt
            })
          })
        } else {
          await finalizeSuccessfulPayment(transaction, {
            event,
            order,
            paymentTransactionId: paymentTransaction.id
          })
        }

        await transaction.updateWebhookEventStatus({
          provider: event.provider,
          eventId: event.eventId,
          status: 'processed',
          processedAt: new Date()
        })
      })
    } catch (error) {
      if (this.webhookRepository.isUniqueConstraintError(error)) {
        const existing = await this.webhookRepository.findWebhookEvent(event.provider, event.eventId)

        if (existing?.status === 'processed') {
          return
        }
      }

      throw error
    }
  }
}

export const webhookService = new WebhookService(paymentWebhookRepository)
