import { Prisma } from '@prisma/client'

import { prisma } from '~/config/db'

import type {
  OrderRepositoryPort,
  OrderTransactionPort
} from '../ports/order-repository.port'
import { orderRepository } from './order.repository'

class PrismaOrderTransaction implements OrderTransactionPort {
  constructor(private readonly tx: Prisma.TransactionClient) {}

  expireStalePendingOrders(data: Parameters<OrderTransactionPort['expireStalePendingOrders']>[0]) {
    return orderRepository.dbExpireStalePendingOrders(this.tx, data)
  }

  findActivePendingOrder(userId: string, now: Date) {
    return orderRepository.findActivePendingOrder(this.tx, userId, now)
  }

  getPublishedCourses(courseIds: string[]) {
    return orderRepository.getPublishedCourses(this.tx, courseIds)
  }

  getExistingEnrollments(data: Parameters<OrderTransactionPort['getExistingEnrollments']>[0]) {
    return orderRepository.getExistingEnrollments(this.tx, data)
  }

  createUniqueInvoiceNumber() {
    return orderRepository.createUniqueInvoiceNumber(this.tx)
  }

  createOrder(data: Parameters<OrderTransactionPort['createOrder']>[0]) {
    return this.tx.order.create({
      data: {
        userId: data.userId,
        orderInvoiceNumber: data.orderInvoiceNumber,
        totalAmount: data.totalAmount,
        currency: data.currency,
        status: data.status,
        expiresAt: data.expiresAt,
        items: {
          create: data.courses.map((course) => ({
            courseId: course.id,
            priceAtPurchase: course.salePrice ?? course.price
          }))
        }
      },
      select: {
        id: true
      }
    })
  }

  completeFreeOrder(data: Parameters<OrderTransactionPort['completeFreeOrder']>[0]) {
    return orderRepository.completeFreeOrder(this.tx, data)
  }

  getOrderById(orderId: string) {
    return orderRepository.getOrderById(this.tx, orderId)
  }

  findOrderForPaymentAttempt(data: Parameters<OrderTransactionPort['findOrderForPaymentAttempt']>[0]) {
    return this.tx.order.findFirst({
      where: {
        id: data.orderId,
        userId: data.userId
      },
      select: {
        id: true,
        orderInvoiceNumber: true,
        totalAmount: true,
        currency: true,
        status: true,
        expiresAt: true,
        payments: {
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            provider: true,
            status: true
          }
        }
      }
    })
  }

  cancelPendingPayments(orderId: string) {
    return this.tx.payment.updateMany({
      where: {
        orderId,
        status: 'pending'
      },
      data: {
        status: 'cancelled'
      }
    })
  }

  createPaymentForOrder(data: Parameters<OrderTransactionPort['createPaymentForOrder']>[0]) {
    return orderRepository.createPaymentForOrder(this.tx, data)
  }

  findOrderForCancel(data: Parameters<OrderTransactionPort['findOrderForCancel']>[0]) {
    return this.tx.order.findFirst({
      where: {
        id: data.orderId,
        userId: data.userId
      },
      select: {
        id: true,
        status: true
      }
    })
  }

  async cancelOrderAndPendingPayments(orderId: string): Promise<void> {
    await this.tx.order.update({
      where: {
        id: orderId
      },
      data: {
        status: 'cancelled'
      }
    })

    await this.cancelPendingPayments(orderId)
  }
}

export class PrismaOrderUnitOfWorkRepository implements OrderRepositoryPort {
  withTransaction<T>(handler: (transaction: OrderTransactionPort) => Promise<T>): Promise<T> {
    return prisma.$transaction((tx) => handler(new PrismaOrderTransaction(tx)))
  }

  expireStalePendingOrders(data: Parameters<OrderRepositoryPort['expireStalePendingOrders']>[0]) {
    return prisma.$transaction((tx) => orderRepository.dbExpireStalePendingOrders(tx, data))
  }

  getOrderForUser(orderId: string, userId: string) {
    return orderRepository.getOrderForUser(orderId, userId)
  }
}

export const orderUnitOfWorkRepository = new PrismaOrderUnitOfWorkRepository()
