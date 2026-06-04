import {
  OrderStatus,
  PaymentStatus
} from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

import { paymentConfig } from '~/modules/payments/config'
import type {
  CancelOrderResponseDto,
  CreatePaymentAttemptResponseDto,
  CreateOrderResponseDto,
  OrderDto
} from '../dto'
import {
  ensureCoursesArePurchasable,
  ensureNotAlreadyEnrolled
} from '../ensures/order.ensure'
import { mapOrder } from '../mappers/order.mapper'
import { orderUnitOfWorkRepository } from '../repositories/order-uow.repository'
import type { OrderRepositoryPort } from '../ports/order-repository.port'

const addMinutes = (date: Date, minutes: number) => {
  const next = new Date(date)
  next.setMinutes(next.getMinutes() + minutes)
  return next
}

const calculateTotalAmount = (courses: Array<{ price: number; salePrice: number | null }>) => {
  return courses.reduce((sum, course) => sum + (course.salePrice ?? course.price), 0)
}

export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepositoryPort
  ) {}

  async expireStalePendingOrders(data?: { userId?: string; orderId?: string }) {
    const now = new Date()

    return this.orderRepository.expireStalePendingOrders({
      userId: data?.userId,
      orderId: data?.orderId,
      now
    })
  }



  async createOrder(data: {
    userId: string
    courseIds: string[]
  }): Promise<CreateOrderResponseDto> {
    const uniqueCourseIds = [...new Set(data.courseIds)]
    const now = new Date()

    return this.orderRepository.withTransaction(async (transaction) => {
      await transaction.expireStalePendingOrders({
        userId: data.userId,
        now
      })

      const pendingOrder = await transaction.findActivePendingOrder(data.userId, now)

      if (pendingOrder) {
        return {
          code: 'PENDING_ORDER_EXISTS',
          order: mapOrder(pendingOrder)
        }
      }

      const courses = await transaction.getPublishedCourses(uniqueCourseIds)
      ensureCoursesArePurchasable(uniqueCourseIds, courses)
      ensureNotAlreadyEnrolled(
        await transaction.getExistingEnrollments({
          userId: data.userId,
          courseIds: uniqueCourseIds
        })
      )

      const totalAmount = calculateTotalAmount(courses)
      const expiresAt = addMinutes(now, paymentConfig.pendingTtlMinutes)
      const orderInvoiceNumber = await transaction.createUniqueInvoiceNumber()

      const order = await transaction.createOrder({
        userId: data.userId,
        orderInvoiceNumber,
        totalAmount,
        currency: 'VND',
        status: totalAmount === 0 ? OrderStatus.completed : OrderStatus.pending,
        expiresAt,
        courses
      })

      if (totalAmount === 0) {
        await transaction.completeFreeOrder({
          orderId: order.id,
          userId: data.userId,
          courseIds: uniqueCourseIds
        })
      }

      const createdOrder = await transaction.getOrderById(order.id)

      if (!createdOrder) {
        throw new AppError(500, ERROR_CODE.INTERNAL_SERVER_ERROR, 'Created order not found')
      }

      return {
        code: totalAmount === 0 ? 'FREE_ORDER_COMPLETED' : 'ORDER_CREATED',
        order: mapOrder(createdOrder)
      }
    })
  }



  async createPaymentAttempt(data: {
    userId: string
    orderId: string
    provider: string
  }): Promise<CreatePaymentAttemptResponseDto> {
    const now = new Date()

    const order = await this.orderRepository.withTransaction(async (transaction) => {
      await transaction.expireStalePendingOrders({
        userId: data.userId,
        orderId: data.orderId,
        now
      })

      const currentOrder = await transaction.findOrderForPaymentAttempt({
        orderId: data.orderId,
        userId: data.userId
      })

      if (!currentOrder) {
        throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Order not found')
      }

      if (currentOrder.totalAmount === 0 || currentOrder.status !== OrderStatus.pending) {
        throw new AppError(409, ERROR_CODE.CONFLICT, 'Order is not payable')
      }

      if (currentOrder.expiresAt <= now) {
        throw new AppError(409, ERROR_CODE.CONFLICT, 'Order has expired')
      }

      const blockingPayment = currentOrder.payments.find(
        (payment) =>
          payment.status === PaymentStatus.success ||
          payment.status === PaymentStatus.manual_review ||
          payment.status === PaymentStatus.late_success
      )

      if (blockingPayment) {
        throw new AppError(
          409,
          ERROR_CODE.CONFLICT,
          'Order already has a payment that cannot be retried automatically'
        )
      }

      const existingPendingPayment = currentOrder.payments.find(
        (payment) => payment.status === PaymentStatus.pending
      )

      if (existingPendingPayment?.provider === data.provider) {
        const refreshedOrder = await transaction.getOrderById(currentOrder.id)

        if (!refreshedOrder) {
          throw new AppError(500, ERROR_CODE.INTERNAL_SERVER_ERROR, 'Order not found')
        }

        return refreshedOrder
      }

      if (existingPendingPayment) {
        await transaction.cancelPendingPayments(currentOrder.id)
      }

      await transaction.createPaymentForOrder({
        orderId: currentOrder.id,
        orderInvoiceNumber: currentOrder.orderInvoiceNumber,
        totalAmount: currentOrder.totalAmount,
        expiresAt: currentOrder.expiresAt,
        providerName: data.provider
      })

      const refreshedOrder = await transaction.getOrderById(currentOrder.id)

      if (!refreshedOrder) {
        throw new AppError(500, ERROR_CODE.INTERNAL_SERVER_ERROR, 'Order not found')
      }

      return refreshedOrder
    })

    return {
      order: mapOrder(order)
    }
  }

  async getMyOrder(data: { userId: string; orderId: string }): Promise<OrderDto> {
    const now = new Date()

    await this.orderRepository.withTransaction(async (transaction) => {
      await transaction.expireStalePendingOrders({
        userId: data.userId,
        orderId: data.orderId,
        now
      })
    })

    const order = await this.orderRepository.getOrderForUser(data.orderId, data.userId)

    if (!order) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Order not found')
    }

    return mapOrder(order)
  }

  async cancelOrder(data: {
    userId: string
    orderId: string
  }): Promise<CancelOrderResponseDto> {
    const updatedOrder = await this.orderRepository.withTransaction(async (transaction) => {
      const order = await transaction.findOrderForCancel({
        orderId: data.orderId,
        userId: data.userId
      })

      if (!order) {
        throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Order not found')
      }

      if (order.status !== OrderStatus.pending) {
        throw new AppError(409, ERROR_CODE.CONFLICT, 'Only pending orders can be cancelled')
      }

      await transaction.cancelOrderAndPendingPayments(data.orderId)

      const refreshedOrder = await transaction.getOrderById(data.orderId)

      if (!refreshedOrder) {
        throw new AppError(500, ERROR_CODE.INTERNAL_SERVER_ERROR, 'Cancelled order not found')
      }

      return refreshedOrder
    })

    return {
      order: mapOrder(updatedOrder)
    }
  }

}

export const orderService = new OrderService(orderUnitOfWorkRepository)
