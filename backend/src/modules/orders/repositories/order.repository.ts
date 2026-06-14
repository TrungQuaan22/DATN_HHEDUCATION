import { CourseStatus, EnrollmentSource, OrderStatus, PaymentStatus, Prisma } from '@prisma/client'
import { randomInt } from 'crypto'

import { sepayConfig } from '~/modules/payments/config'

import type {
  CreateOrderRecord,
  OrderRecord,
  OrderRepositoryPort,
  PaymentAttemptOrderRecord
} from '../ports/order-repository.port'

const ORDER_SELECT = {
  id: true,
  orderInvoiceNumber: true,
  totalAmount: true,
  currency: true,
  status: true,
  expiresAt: true,
  createdAt: true,
  items: {
    select: {
      id: true,
      courseId: true,
      priceAtPurchase: true,
      course: {
        select: {
          title: true,
          slug: true
        }
      }
    },
    orderBy: {
      id: 'asc'
    }
  },
  payments: {
    select: {
      id: true,
      provider: true,
      amount: true,
      currency: true,
      status: true,
      qrCodeUrl: true,
      checkoutUrl: true,
      expiresAt: true,
      paidAt: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 1
  }
} satisfies Prisma.OrderSelect

type PrismaOrderRecord = Prisma.OrderGetPayload<{
  select: typeof ORDER_SELECT
}>

const buildInvoiceNumber = () => {
  const suffixLength = Math.max(1, sepayConfig.paymentCodeSuffixLength)
  const firstDigit = String(randomInt(1, 10))
  const remainingDigits = Array.from({ length: suffixLength - 1 }, () => {
    return String(randomInt(0, 10))
  }).join('')

  return `${sepayConfig.paymentCodePrefix}${firstDigit}${remainingDigits}`
}

const mapPrismaOrderToRecord = (order: PrismaOrderRecord): OrderRecord => {
  return {
    id: order.id,
    orderInvoiceNumber: order.orderInvoiceNumber,
    totalAmount: Number(order.totalAmount),
    currency: order.currency,
    status: order.status,
    expiresAt: order.expiresAt,
    createdAt: order.createdAt,
    items: order.items.map((item) => {
      return {
        id: item.id,
        courseId: item.courseId,
        priceAtPurchase: Number(item.priceAtPurchase),
        course: {
          title: item.course.title,
          slug: item.course.slug
        }
      }
    }),
    payments: order.payments.map((payment) => {
      return {
        id: payment.id,
        provider: payment.provider,
        amount: Number(payment.amount),
        currency: payment.currency,
        status: payment.status,
        qrCodeUrl: payment.qrCodeUrl,
        checkoutUrl: payment.checkoutUrl,
        expiresAt: payment.expiresAt,
        paidAt: payment.paidAt
      }
    })
  }
}

export class PrismaOrderRepository implements OrderRepositoryPort {
  constructor(private readonly transactionClient: Prisma.TransactionClient) {}

  async expireStalePendingOrders(data: {
    now: Date
    userId?: string
    orderId?: string
  }): Promise<void> {
    await this.transactionClient.order.updateMany({
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
  }

  async findActivePendingOrder(userId: string, now: Date): Promise<OrderRecord | null> {
    const order = await this.transactionClient.order.findFirst({
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

    return order ? mapPrismaOrderToRecord(order) : null
  }

  findPublishedCourses(courseIds: string[]) {
    return this.transactionClient.course.findMany({
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
  }

  findExistingEnrollments(data: { userId: string; courseIds: string[] }) {
    return this.transactionClient.enrollment.findMany({
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
  }

  async createUniqueInvoiceNumber(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const invoiceNumber = buildInvoiceNumber()
      const existingOrder = await this.transactionClient.order.findUnique({
        where: {
          orderInvoiceNumber: invoiceNumber
        },
        select: {
          id: true
        }
      })

      if (!existingOrder) {
        return invoiceNumber
      }
    }

    throw new Error('Could not generate a unique order invoice number')
  }

  createOrder(data: CreateOrderRecord): Promise<{ id: string }> {
    return this.transactionClient.order.create({
      data: {
        userId: data.userId,
        orderInvoiceNumber: data.orderInvoiceNumber,
        totalAmount: data.totalAmount,
        currency: data.currency,
        status: data.status,
        expiresAt: data.expiresAt,
        items: {
          create: data.courses.map((course) => {
            return {
              courseId: course.id,
              priceAtPurchase: course.salePrice ?? course.price
            }
          })
        }
      },
      select: {
        id: true
      }
    })
  }

  async completeFreeOrder(data: {
    orderId: string
    userId: string
    courseIds: string[]
  }): Promise<void> {
    const result = await this.transactionClient.order.updateMany({
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

    await this.transactionClient.enrollment.createMany({
      data: data.courseIds.map((courseId) => {
        return {
          userId: data.userId,
          courseId,
          orderId: data.orderId,
          source: EnrollmentSource.free
        }
      }),
      skipDuplicates: true
    })
  }

  async findOrderById(orderId: string): Promise<OrderRecord | null> {
    const order = await this.transactionClient.order.findUnique({
      where: {
        id: orderId
      },
      select: ORDER_SELECT
    })

    return order ? mapPrismaOrderToRecord(order) : null
  }

  async findOrderForUser(orderId: string, userId: string): Promise<OrderRecord | null> {
    const order = await this.transactionClient.order.findFirst({
      where: {
        id: orderId,
        userId
      },
      select: ORDER_SELECT
    })

    return order ? mapPrismaOrderToRecord(order) : null
  }

  async findOrderForPaymentAttempt(data: {
    userId: string
    orderId: string
  }): Promise<PaymentAttemptOrderRecord | null> {
    const order = await this.transactionClient.order.findFirst({
      where: {
        id: data.orderId,
        userId: data.userId
      },
      select: {
        id: true,
        orderInvoiceNumber: true,
        totalAmount: true,
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

    if (!order) {
      return null
    }

    return {
      id: order.id,
      orderInvoiceNumber: order.orderInvoiceNumber,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      expiresAt: order.expiresAt,
      payments: order.payments
    }
  }

  async cancelPendingPayments(orderId: string): Promise<void> {
    await this.transactionClient.payment.updateMany({
      where: {
        orderId,
        status: PaymentStatus.pending
      },
      data: {
        status: PaymentStatus.cancelled
      }
    })
  }

  async createPaymentForOrder(
    data: Parameters<OrderRepositoryPort['createPaymentForOrder']>[0]
  ): Promise<void> {
    await this.transactionClient.payment.create({
      data: {
        orderId: data.orderId,
        provider: data.provider,
        providerPaymentId: data.providerPaymentId,
        amount: data.amount,
        currency: 'VND',
        status: PaymentStatus.pending,
        qrCodeUrl: data.qrCodeUrl,
        checkoutUrl: data.checkoutUrl,
        expiresAt: data.expiresAt
      }
    })
  }

  findOrderForCancel(data: { userId: string; orderId: string }) {
    return this.transactionClient.order.findFirst({
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
    const result = await this.transactionClient.order.updateMany({
      where: {
        id: orderId,
        status: OrderStatus.pending
      },
      data: {
        status: OrderStatus.cancelled
      }
    })

    if (result.count === 0) {
      throw new Error('Order is not pending')
    }

    await this.cancelPendingPayments(orderId)
  }
}
