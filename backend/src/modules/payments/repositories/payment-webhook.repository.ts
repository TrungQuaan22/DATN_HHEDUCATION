import { EnrollmentSource, OrderStatus, Prisma } from '@prisma/client'

import { prisma } from '~/config/db'

import type {
  PaymentWebhookRepositoryPort,
  PaymentWebhookTransactionPort
} from '../ports/payment-webhook-repository.port'
import { paymentRepository } from './payment.repository'

class PrismaPaymentWebhookTransaction implements PaymentWebhookTransactionPort {
  constructor(private readonly tx: Prisma.TransactionClient) {}

  createWebhookEvent(data: Parameters<PaymentWebhookTransactionPort['createWebhookEvent']>[0]) {
    return paymentRepository.createWebhookEvent(this.tx, data)
  }

  updateWebhookEventStatus(
    data: Parameters<PaymentWebhookTransactionPort['updateWebhookEventStatus']>[0]
  ) {
    return paymentRepository.updateWebhookEventStatus(this.tx, data)
  }

  createPaymentTransaction(event: Parameters<PaymentWebhookTransactionPort['createPaymentTransaction']>[0]) {
    return paymentRepository.createPaymentTransaction(this.tx, event)
  }

  updatePaymentTransaction(
    data: Parameters<PaymentWebhookTransactionPort['updatePaymentTransaction']>[0]
  ) {
    return paymentRepository.updatePaymentTransaction(this.tx, data)
  }

  createManualReviewPayment(
    data: Parameters<PaymentWebhookTransactionPort['createManualReviewPayment']>[0]
  ) {
    return paymentRepository.createManualReviewPayment(this.tx, data)
  }

  updatePayment(
    paymentId: string,
    data: Parameters<PaymentWebhookTransactionPort['updatePayment']>[1]
  ) {
    return paymentRepository.updatePayment(this.tx, paymentId, {
      status: data.status,
      amount: data.amount,
      transactionRef: data.transactionRef,
      paidAt: data.paidAt,
      metadata:
        data.metadata === undefined
          ? undefined
          : (JSON.parse(JSON.stringify(data.metadata)) as Prisma.InputJsonValue)
    })
  }

  findOrderForWebhook(orderInvoiceNumber: string, provider: string) {
    return paymentRepository.findOrderForWebhook(this.tx, orderInvoiceNumber, provider)
  }

  async completeOrderWithPayment(data: {
    orderId: string
    userId: string
    courseIds: string[]
  }): Promise<void> {
    const result = await this.tx.order.updateMany({
      where: {
        id: data.orderId,
        status: OrderStatus.pending
      },
      data: {
        status: OrderStatus.completed
      }
    })

    if (result.count === 0) {
      throw new Error('Order is not pending')
    }

    await this.tx.enrollment.createMany({
      data: data.courseIds.map((courseId) => ({
        userId: data.userId,
        courseId,
        orderId: data.orderId,
        source: EnrollmentSource.payment
      })),
      skipDuplicates: true
    })
  }
}

export class PrismaPaymentWebhookRepository implements PaymentWebhookRepositoryPort {
  withTransaction<T>(
    handler: (transaction: PaymentWebhookTransactionPort) => Promise<T>
  ): Promise<T> {
    return prisma.$transaction((tx) => handler(new PrismaPaymentWebhookTransaction(tx)))
  }

  findWebhookEvent(provider: string, eventId: string) {
    return paymentRepository.findWebhookEvent(provider, eventId)
  }

  isUniqueConstraintError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
  }
}

export const paymentWebhookRepository = new PrismaPaymentWebhookRepository()
