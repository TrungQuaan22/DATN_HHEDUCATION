import { OrderStatus } from '@prisma/client'

import { paymentConfig } from '~/modules/payments/config'
import { getPaymentProvider } from '~/modules/payments/providers/provider.factory'
import type { PaymentProviderName } from '~/modules/payments/constants'

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
  ensureCoursesArePurchasable,
  ensureNotAlreadyEnrolled,
  ensureOrderCanBeCancelled,
  ensureOrderExists,
  ensureOrderHasNotExpired,
  ensureOrderIsPayable,
  ensureReloadedOrderExists,
  ensurePaymentCanBeRetried
} from '../ensures/order.ensure'
import { mapOrder } from '../mappers/order.mapper'
import {
  calculateOrderExpiration,
  calculateOrderTotalAmount,
  findBlockingPayment,
  findPendingPayment,
  isFreeOrder
} from '../policies/order.policy'
import type { OrderTransactionPort } from '../ports/order-transaction.port'
import { orderTransaction } from '../repositories/order-transaction'

export class OrderService {
  constructor(private readonly orderTransaction: OrderTransactionPort) {}

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
      ensureCoursesArePurchasable(uniqueCourseIds, courses)

      const existingEnrollments = await repository.findExistingEnrollments({
        userId: data.userId,
        courseIds: uniqueCourseIds
      })
      ensureNotAlreadyEnrolled(existingEnrollments)

      const totalAmount = calculateOrderTotalAmount(courses)
      const freeOrder = isFreeOrder(totalAmount)
      const expiresAt = calculateOrderExpiration(now, paymentConfig.pendingTtlMinutes)
      const orderInvoiceNumber = await repository.createUniqueInvoiceNumber()

      const order = await repository.createOrder({
        userId: data.userId,
        orderInvoiceNumber,
        totalAmount,
        currency: 'VND',
        status: freeOrder ? OrderStatus.completed : OrderStatus.pending,
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
      const createdOrder = ensureReloadedOrderExists(createdOrderRecord)

      return {
        code: freeOrder ? 'FREE_ORDER_COMPLETED' : 'ORDER_CREATED',
        order: mapOrder(createdOrder)
      }
    })
  }

  async createPaymentAttempt(data: CreatePaymentAttemptDto): Promise<CreatePaymentAttemptResponse> {
    const now = new Date()

    const order = await this.orderTransaction.run(async (repository) => {
      await repository.expireStalePendingOrders({
        userId: data.userId,
        orderId: data.orderId,
        now
      })

      const currentOrderRecord = await repository.findOrderForPaymentAttempt({
        orderId: data.orderId,
        userId: data.userId
      })
      const currentOrder = ensureOrderExists(currentOrderRecord)

      ensureOrderIsPayable(currentOrder)
      ensureOrderHasNotExpired(currentOrder.expiresAt, now)

      const blockingPayment = findBlockingPayment(currentOrder.payments)
      ensurePaymentCanBeRetried(blockingPayment)

      const existingPendingPayment = findPendingPayment(currentOrder.payments)

      if (existingPendingPayment?.provider === data.provider) {
        const refreshedOrderRecord = await repository.findOrderById(currentOrder.id)
        const refreshedOrder = ensureReloadedOrderExists(refreshedOrderRecord)

        return refreshedOrder
      }

      if (existingPendingPayment) {
        await repository.cancelPendingPayments(currentOrder.id)
      }

      const providerInstance = getPaymentProvider(data.provider)
      const providerPayment = providerInstance.createPayment({
        orderInvoiceNumber: currentOrder.orderInvoiceNumber,
        amount: currentOrder.totalAmount,
        expiresAt: currentOrder.expiresAt
      })

      await repository.createPaymentForOrder({
        orderId: currentOrder.id,
        provider: providerPayment.provider,
        providerPaymentId: providerPayment.providerPaymentId,
        amount: currentOrder.totalAmount,
        qrCodeUrl: providerPayment.qrCodeUrl,
        checkoutUrl: providerPayment.checkoutUrl,
        expiresAt: providerPayment.expiresAt ?? currentOrder.expiresAt
      })

      const refreshedOrderRecord = await repository.findOrderById(currentOrder.id)
      const refreshedOrder = ensureReloadedOrderExists(refreshedOrderRecord)

      return refreshedOrder
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

    const existingOrder = ensureOrderExists(order)

    return mapOrder(existingOrder)
  }

  async cancelOrder(data: CancelOrderDto): Promise<CancelOrderResponse> {
    const updatedOrder = await this.orderTransaction.run(async (repository) => {
      const orderRecord = await repository.findOrderForCancel({
        orderId: data.orderId,
        userId: data.userId
      })
      const order = ensureOrderExists(orderRecord)

      ensureOrderCanBeCancelled(order.status)

      await repository.cancelOrderAndPendingPayments(data.orderId)

      const refreshedOrderRecord = await repository.findOrderById(data.orderId)
      const refreshedOrder = ensureReloadedOrderExists(refreshedOrderRecord)

      return refreshedOrder
    })

    return {
      order: mapOrder(updatedOrder)
    }
  }
}

export const orderService = new OrderService(orderTransaction)
