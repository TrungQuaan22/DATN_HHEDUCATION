import {
  OrderStatus,
  PaymentStatus,
  PaymentTransactionMatchStatus,
  Prisma,
  WebhookStatus
} from '@prisma/client'

import { prisma } from '~/config/db'

import {
  ADMIN_PAYMENT_TRANSACTION_LIST_SELECT,
  type NormalizedPaymentEvent
} from '../dto'

type TransactionClient = Prisma.TransactionClient

const toJsonValue = (value: unknown): Prisma.InputJsonValue => {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

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

export const paymentRepository = {
  // --- Admin Payment Transactions ---
  async listTransactions(data: {
    where: Prisma.PaymentTransactionWhereInput
    skip: number
    take: number
  }) {
    return prisma.$transaction([
      prisma.paymentTransaction.findMany({
        where: data.where,
        select: ADMIN_PAYMENT_TRANSACTION_LIST_SELECT,
        orderBy: {
          createdAt: 'desc'
        },
        skip: data.skip,
        take: data.take
      }),
      prisma.paymentTransaction.count({
        where: data.where
      })
    ])
  },

  // --- Webhook Events ---
  createWebhookEvent(
    tx: TransactionClient,
    data: {
      provider: string
      eventId: string
      payload: unknown
    }
  ) {
    return tx.webhookEvent.create({
      data: {
        provider: data.provider,
        eventId: data.eventId,
        status: WebhookStatus.processing,
        payload: toJsonValue(data.payload)
      }
    })
  },

  updateWebhookEventStatus(
    tx: TransactionClient,
    data: {
      provider: string
      eventId: string
      status: WebhookStatus
      errorMessage?: string | null
      processedAt?: Date
    }
  ) {
    return tx.webhookEvent.update({
      where: {
        provider_eventId: {
          provider: data.provider,
          eventId: data.eventId
        }
      },
      data: {
        status: data.status,
        errorMessage: data.errorMessage,
        processedAt: data.processedAt
      }
    })
  },

  async findWebhookEvent(provider: string, eventId: string) {
    return prisma.webhookEvent.findUnique({
      where: {
        provider_eventId: {
          provider,
          eventId
        }
      },
      select: {
        status: true
      }
    })
  },

  // --- Payment Transactions ---
  createPaymentTransaction(tx: TransactionClient, event: NormalizedPaymentEvent) {
    return tx.paymentTransaction.upsert({
      where: {
        provider_transactionRef: {
          provider: event.provider,
          transactionRef: event.transactionRef
        }
      },
      create: {
        provider: event.provider,
        providerEventId: event.eventId,
        transactionRef: event.transactionRef,
        orderInvoiceNumber: event.orderInvoiceNumber,
        amount: event.amount,
        currency: event.currency,
        direction: event.direction,
        transactionDate: event.paidAt,
        rawPayload: toJsonValue(event.rawPayload),
        matchStatus:
          event.direction === 'in'
            ? PaymentTransactionMatchStatus.unmatched
            : PaymentTransactionMatchStatus.ignored,
        metadata: toJsonValue({
          gateway: event.gateway,
          accountNumber: event.accountNumber
        })
      },
      update: {
        orderInvoiceNumber: event.orderInvoiceNumber,
        amount: event.amount,
        currency: event.currency,
        direction: event.direction,
        transactionDate: event.paidAt,
        rawPayload: toJsonValue(event.rawPayload)
      },
      select: {
        id: true
      }
    })
  },

  updatePaymentTransaction(
    tx: TransactionClient,
    data: {
      id: string
      orderId?: string
      paymentId?: string
      matchStatus: PaymentTransactionMatchStatus
      metadata?: unknown
    }
  ) {
    return tx.paymentTransaction.update({
      where: {
        id: data.id
      },
      data: {
        orderId: data.orderId,
        paymentId: data.paymentId,
        matchStatus: data.matchStatus,
        metadata: data.metadata === undefined ? undefined : toJsonValue(data.metadata)
      }
    })
  },

  // --- Payments & Orders Webhook Integrations ---
  createManualReviewPayment(
    tx: TransactionClient,
    data: {
      event: NormalizedPaymentEvent
      reason: string
      orderId: string
      expectedAmount?: number
      orderStatus?: OrderStatus
      expiredAt?: Date
    }
  ) {
    return tx.payment.create({
      data: {
        orderId: data.orderId,
        provider: data.event.provider,
        providerPaymentId: data.event.orderInvoiceNumber,
        amount: data.event.amount,
        currency: data.event.currency,
        status: PaymentStatus.manual_review,
        paidAt: data.event.paidAt,
        metadata: toJsonValue(
          buildReviewMetadata(data.event, {
            reason: data.reason,
            expectedAmount: data.expectedAmount,
            orderStatus: data.orderStatus,
            expiredAt: data.expiredAt
          })
        )
      },
      select: {
        id: true
      }
    })
  },

  updatePayment(
    tx: TransactionClient,
    paymentId: string,
    data: Prisma.PaymentUpdateInput
  ) {
    return tx.payment.update({
      where: {
        id: paymentId
      },
      data
    })
  },

  findOrderForWebhook(tx: TransactionClient, orderInvoiceNumber: string, provider: string) {
    return tx.order.findUnique({
      where: {
        orderInvoiceNumber
      },
      select: {
        id: true,
        userId: true,
        totalAmount: true,
        currency: true,
        status: true,
        expiresAt: true,
        items: {
          select: {
            courseId: true
          }
        },
        payments: {
          where: {
            provider
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            id: true,
            status: true
          }
        }
      }
    })
  }
}
