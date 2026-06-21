import { OrderStatus } from '@prisma/client'

import { paymentConfig } from '~/modules/payments/config'
import { getPaymentProvider } from '~/modules/payments/providers/provider.factory'
import { AppError } from '~/common/error/app-error'
import { ERROR_CODE } from '~/common/constant/error-code'

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
  ensureOrderExists,
  ensureReloadedOrderExists
} from '../ensures/order.ensure'
import { mapOrder } from '../mappers/order.mapper'
import { Order } from '../entities/order.entity'
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

      const totalAmount = Order.calculateTotalAmount(courses)
      const freeOrder = totalAmount === 0
      const expiresAt = Order.calculateExpiration(now, paymentConfig.pendingTtlMinutes)
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
      const currentOrderRecordExists = ensureOrderExists(currentOrderRecord)

      // Instantiate the Order Domain Entity
      const orderEntity = new Order(currentOrderRecordExists as any)

      if (!orderEntity.isPayable()) {
        throw new AppError(409, ERROR_CODE.CONFLICT, 'Order is not payable')
      }
      if (orderEntity.isExpired(now)) {
        throw new AppError(409, ERROR_CODE.CONFLICT, 'Order has expired')
      }
      if (!orderEntity.canPaymentBeRetried()) {
        throw new AppError(
          409,
          ERROR_CODE.CONFLICT,
          'Order already has a payment that cannot be retried automatically'
        )
      }

      const existingPendingPayment = orderEntity.findPendingPayment()

      if (existingPendingPayment?.provider === data.provider) {
        const refreshedOrderRecord = await repository.findOrderById(orderEntity.id)
        const refreshedOrder = ensureReloadedOrderExists(refreshedOrderRecord)

        return refreshedOrder
      }

      if (existingPendingPayment) {
        await repository.cancelPendingPayments(orderEntity.id)
      }

      const providerInstance = getPaymentProvider(data.provider)
      const providerPayment = providerInstance.createPayment({
        orderInvoiceNumber: orderEntity.orderInvoiceNumber,
        amount: orderEntity.totalAmount,
        expiresAt: orderEntity.expiresAt
      })

      await repository.createPaymentForOrder({
        orderId: orderEntity.id,
        provider: providerPayment.provider,
        providerPaymentId: providerPayment.providerPaymentId,
        amount: orderEntity.totalAmount,
        qrCodeUrl: providerPayment.qrCodeUrl,
        checkoutUrl: providerPayment.checkoutUrl,
        expiresAt: providerPayment.expiresAt ?? orderEntity.expiresAt
      })

      const refreshedOrderRecord = await repository.findOrderById(orderEntity.id)
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
      const orderRecordExists = ensureOrderExists(orderRecord)

      if (orderRecordExists.status !== 'pending') {
        throw new AppError(409, ERROR_CODE.CONFLICT, 'Only pending orders can be cancelled')
      }

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
