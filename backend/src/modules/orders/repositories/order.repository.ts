import {
  CourseStatus,
  EnrollmentSource,
  OrderStatus,
  PaymentStatus,
  Prisma
} from '@prisma/client'
import { randomInt } from 'crypto'

import { prisma } from '~/config/db'
import { sepayConfig } from '~/modules/payments/config'
import { getPaymentProvider } from '~/modules/payments/providers/provider.factory'

import { ORDER_SELECT } from '../mappers/order.mapper'

type TransactionClient = Prisma.TransactionClient

const buildInvoiceNumber = () => {
  const suffixLength = Math.max(1, sepayConfig.paymentCodeSuffixLength)
  const firstDigit = String(randomInt(1, 10))
  const remainingDigits = Array.from({ length: suffixLength - 1 }, () =>
    String(randomInt(0, 10))
  ).join('')

  return `${sepayConfig.paymentCodePrefix}${firstDigit}${remainingDigits}`
}

export const orderRepository = {
  async createUniqueInvoiceNumber(tx: TransactionClient) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const invoiceNumber = buildInvoiceNumber()
      const existing = await tx.order.findUnique({
        where: {
          orderInvoiceNumber: invoiceNumber
        },
        select: {
          id: true
        }
      })

      if (!existing) {
        return invoiceNumber
      }
    }

    throw new Error('Could not generate a unique order invoice number')
  },

  getOrderForUser(orderId: string, userId: string) {
    return prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      },
      select: ORDER_SELECT
    })
  },

  dbExpireStalePendingOrders(
    tx: TransactionClient,
    data: {
      now: Date
      userId?: string
      orderId?: string
    }
  ) {
    return tx.order.updateMany({
      where: {
        userId: data.userId,
        id: data.orderId,
        status: OrderStatus.pending,
        expiresAt: {
          lte: data.now
        }
      },
      data: {
        status: OrderStatus.expired
      }
    })
  },

  findActivePendingOrder(tx: TransactionClient, userId: string, now: Date) {
    return tx.order.findFirst({
      where: {
        userId,
        status: OrderStatus.pending,
        expiresAt: {
          gt: now
        }
      },
      select: ORDER_SELECT,
      orderBy: {
        createdAt: 'desc'
      }
    })
  },

  getPublishedCourses(tx: TransactionClient, courseIds: string[]) {
    return tx.course.findMany({
      where: {
        id: {
          in: courseIds
        },
        status: CourseStatus.published,
        deletedAt: null
      },
      select: {
        id: true,
        price: true,
        salePrice: true
      }
    })
  },

  getExistingEnrollments(
    tx: TransactionClient,
    data: {
      userId: string
      courseIds: string[]
    }
  ) {
    return tx.enrollment.findMany({
      where: {
        userId: data.userId,
        courseId: {
          in: data.courseIds
        }
      },
      select: {
        courseId: true
      }
    })
  },

  getOrderById(tx: TransactionClient, orderId: string) {
    return tx.order.findUnique({
      where: {
        id: orderId
      },
      select: ORDER_SELECT
    })
  },

  async completeFreeOrder(
    tx: TransactionClient,
    data: {
      orderId: string
      userId: string
      courseIds: string[]
    }
  ) {
    await tx.order.update({
      where: {
        id: data.orderId
      },
      data: {
        status: OrderStatus.completed
      }
    })

    await tx.enrollment.createMany({
      data: data.courseIds.map((courseId) => ({
        userId: data.userId,
        courseId,
        orderId: data.orderId,
        source: EnrollmentSource.free
      })),
      skipDuplicates: true
    })
  },

  async createPaymentForOrder(
    tx: TransactionClient,
    data: {
      orderId: string
      orderInvoiceNumber: string
      totalAmount: number
      expiresAt: Date
      providerName: string
    }
  ) {
    const provider = getPaymentProvider(data.providerName)
    const providerPayment = provider.createPayment({
      orderInvoiceNumber: data.orderInvoiceNumber,
      amount: data.totalAmount,
      expiresAt: data.expiresAt
    })

    await tx.payment.create({
      data: {
        orderId: data.orderId,
        provider: providerPayment.provider,
        providerPaymentId: providerPayment.providerPaymentId,
        amount: data.totalAmount,
        currency: 'VND',
        status: PaymentStatus.pending,
        qrCodeUrl: providerPayment.qrCodeUrl,
        checkoutUrl: providerPayment.checkoutUrl,
        expiresAt: providerPayment.expiresAt
      }
    })
  }
}
