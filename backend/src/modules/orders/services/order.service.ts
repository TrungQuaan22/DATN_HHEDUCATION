import { paymentConfig } from '~/modules/payments/config'

import type {
  CancelOrderDto,
  CancelOrderResponse,
  CreateOrderDto,
  CreatePaymentAttemptDto,
  CreatePaymentAttemptResponse,
  CreateOrderResponse,
  OrderResponse
} from '../dto'
import {
  ensureOrderExists,
  ensureReloadedOrderExists
} from '../ensures/order.ensure'
import { mapOrder } from '../mappers/order.mapper'
import {
  calculateOrderExpiration,
  calculateOrderTotal,
  findPendingPayment,
  isFreeOrder,
  validateCoursesPurchasable,
  validateNotEnrolled,
  validateOrderCanBeCancelled,
  validatePaymentAttempt
} from '../policies/order.policy'
import type { OrderPaymentProviderPort } from '../ports/order-payment-provider.port'
import type { OrderTransactionPort } from '../ports/order-transaction.port'

export class OrderService {
  constructor(
    private readonly orderTransaction: OrderTransactionPort,
    private readonly paymentProvider: OrderPaymentProviderPort
  ) {}

  async createOrder(data: CreateOrderDto): Promise<CreateOrderResponse> {
    const uniqueCourseIds = [...new Set(data.courseIds)]
    const now = new Date()

    return this.orderTransaction.run(async (repository) => {
      await repository.expireStalePendingOrders({
        userId: data.userId,
        now
      })

      const pendingOrder = await repository.findActivePendingOrder(data.userId, now)

      if (pendingOrder) {
        return {
          code: 'PENDING_ORDER_EXISTS',
          order: mapOrder(pendingOrder)
        }
      }

      const courses = await repository.findPublishedCourses(uniqueCourseIds)
      validateCoursesPurchasable(uniqueCourseIds, courses)

      const existingEnrollments = await repository.findExistingEnrollments({
        userId: data.userId,
        courseIds: uniqueCourseIds
      })
      validateNotEnrolled(existingEnrollments)

      const totalAmount = calculateOrderTotal(courses)
      const freeOrder = isFreeOrder(totalAmount)
      const expiresAt = calculateOrderExpiration(now, paymentConfig.pendingTtlMinutes)
      const orderInvoiceNumber = await repository.createUniqueInvoiceNumber()

      const order = await repository.createOrder({
        userId: data.userId,
        orderInvoiceNumber,
        totalAmount,
        currency: 'VND',
        status: 'pending',
        expiresAt,
        courses
      })

      if (freeOrder) {
        await repository.completeFreeOrder({
          orderId: order.id,
          userId: data.userId,
          courseIds: uniqueCourseIds
        })
      }

      const createdOrderRecord = await repository.findOrderById(order.id)
      ensureReloadedOrderExists(createdOrderRecord)

      return {
        code: freeOrder ? 'FREE_ORDER_COMPLETED' : 'ORDER_CREATED',
        order: mapOrder(createdOrderRecord)
      }
    })
  }

  async createPaymentAttempt(data: CreatePaymentAttemptDto): Promise<CreatePaymentAttemptResponse> {
    const now = new Date()

    const order = await this.orderTransaction.run(async (repository) => {
      await repository.lockOrderForUser({
        userId: data.userId,
        orderId: data.orderId
      })

      await repository.expireStalePendingOrders({
        userId: data.userId,
        orderId: data.orderId,
        now
      })

      const currentOrderRecord = await repository.findOrderForPaymentAttempt({
        orderId: data.orderId,
        userId: data.userId
      })
      ensureOrderExists(currentOrderRecord)

      validatePaymentAttempt(currentOrderRecord, now)

      const existingPendingPayment = findPendingPayment(currentOrderRecord.payments)

      if (existingPendingPayment?.provider === data.provider) {
        const refreshedOrderRecord = await repository.findOrderById(currentOrderRecord.id)
        ensureReloadedOrderExists(refreshedOrderRecord)

        return refreshedOrderRecord
      }

      if (existingPendingPayment) {
        await repository.cancelPendingPayments(currentOrderRecord.id)
      }

      const providerPayment = this.paymentProvider.createPayment(data.provider, {
        orderInvoiceNumber: currentOrderRecord.orderInvoiceNumber,
        amount: currentOrderRecord.totalAmount,
        expiresAt: currentOrderRecord.expiresAt
      })

      await repository.createPaymentForOrder({
        orderId: currentOrderRecord.id,
        provider: providerPayment.provider,
        providerPaymentId: providerPayment.providerPaymentId,
        amount: currentOrderRecord.totalAmount,
        qrCodeUrl: providerPayment.qrCodeUrl,
        checkoutUrl: providerPayment.checkoutUrl,
        expiresAt: providerPayment.expiresAt ?? currentOrderRecord.expiresAt
      })

      const refreshedOrderRecord = await repository.findOrderById(currentOrderRecord.id)
      ensureReloadedOrderExists(refreshedOrderRecord)

      return refreshedOrderRecord
    })

    return {
      order: mapOrder(order)
    }
  }

  async getMyOrder(data: { userId: string; orderId: string }): Promise<OrderResponse> {
    const now = new Date()

    const order = await this.orderTransaction.run(async (repository) => {
      await repository.expireStalePendingOrders({
        userId: data.userId,
        orderId: data.orderId,
        now
      })

      return repository.findOrderForUser(data.orderId, data.userId)
    })

    ensureOrderExists(order)

    return mapOrder(order)
  }

  async cancelOrder(data: CancelOrderDto): Promise<CancelOrderResponse> {
    const now = new Date()

    const updatedOrder = await this.orderTransaction.run(async (repository) => {
      await repository.lockOrderForUser({
        userId: data.userId,
        orderId: data.orderId
      })

      await repository.expireStalePendingOrders({
        userId: data.userId,
        orderId: data.orderId,
        now
      })

      const orderRecord = await repository.findOrderForCancel({
        orderId: data.orderId,
        userId: data.userId
      })
      ensureOrderExists(orderRecord)

      validateOrderCanBeCancelled(orderRecord)

      await repository.cancelOrderAndPendingPayments(data.orderId)

      const refreshedOrderRecord = await repository.findOrderById(data.orderId)
      ensureReloadedOrderExists(refreshedOrderRecord)

      return refreshedOrderRecord
    })

    return {
      order: mapOrder(updatedOrder)
    }
  }
}
