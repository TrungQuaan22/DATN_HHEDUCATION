import { prisma } from '~/config/db'
import type { Prisma } from '@prisma/client'
import type {
  AdminOrderDetailRecord,
  AdminOrderListItemRecord,
  AdminOrderRepositoryPort,
  ListAdminOrdersFilters
} from '../ports/admin-order-repository.port'

const listSelect = {
  id: true,
  orderInvoiceNumber: true,
  totalAmount: true,
  currency: true,
  status: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      email: true,
      fullName: true
    }
  },
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
      providerPaymentId: true,
      amount: true,
      currency: true,
      transactionRef: true,
      checkoutUrl: true,
      qrCodeUrl: true,
      expiresAt: true,
      metadata: true,
      status: true,
      createdAt: true,
      paidAt: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 1
  },
  _count: {
    select: {
      enrollments: true,
      paymentTransactions: true
    }
  }
} satisfies Prisma.OrderSelect

const detailSelect = {
  ...listSelect,
  payments: {
    select: {
      id: true,
      provider: true,
      providerPaymentId: true,
      amount: true,
      currency: true,
      transactionRef: true,
      checkoutUrl: true,
      qrCodeUrl: true,
      expiresAt: true,
      metadata: true,
      status: true,
      createdAt: true,
      paidAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  },
  paymentTransactions: {
    select: {
      id: true,
      provider: true,
      providerEventId: true,
      transactionRef: true,
      orderInvoiceNumber: true,
      amount: true,
      currency: true,
      direction: true,
      transactionDate: true,
      matchStatus: true,
      metadata: true,
      createdAt: true,
      paymentId: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  },
  enrollments: {
    select: {
      id: true,
      userId: true,
      courseId: true,
      source: true,
      manualReason: true,
      enrolledAt: true
    },
    orderBy: {
      enrolledAt: 'desc'
    }
  }
} satisfies Prisma.OrderSelect

function buildOrderWhere(filters: ListAdminOrdersFilters): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {
    status: filters.status,
    userId: filters.userId
  }

  if (filters.createdFrom || filters.createdTo) {
    where.createdAt = {
      gte: filters.createdFrom,
      lte: filters.createdTo
    }
  }

  if (filters.paymentStatus || filters.provider) {
    where.payments = {
      some: {
        status: filters.paymentStatus,
        provider: filters.provider
      }
    }
  }

  if (filters.search) {
    where.OR = [
      {
        orderInvoiceNumber: {
          contains: filters.search,
          mode: 'insensitive'
        }
      },
      {
        user: {
          email: {
            contains: filters.search,
            mode: 'insensitive'
          }
        }
      },
      {
        user: {
          fullName: {
            contains: filters.search,
            mode: 'insensitive'
          }
        }
      }
    ]
  }

  return where
}

export class PrismaAdminOrderRepository implements AdminOrderRepositoryPort {
  async listOrders(data: {
    filters: ListAdminOrdersFilters
    page: number
    limit: number
  }): Promise<[AdminOrderListItemRecord[], number]> {
    const where = buildOrderWhere(data.filters)
    const skip = (data.page - 1) * data.limit

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        select: listSelect,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: data.limit
      }),
      prisma.order.count({
        where
      })
    ])

    const records: AdminOrderListItemRecord[] = orders.map((o) => ({
      id: o.id,
      orderInvoiceNumber: o.orderInvoiceNumber,
      totalAmount: Number(o.totalAmount),
      currency: o.currency,
      status: o.status,
      expiresAt: o.expiresAt,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      user: o.user,
      items: o.items.map((i) => ({
        id: i.id,
        courseId: i.courseId,
        priceAtPurchase: Number(i.priceAtPurchase),
        course: i.course
      })),
      payments: o.payments.map((p) => ({
        id: p.id,
        provider: p.provider,
        providerPaymentId: p.providerPaymentId,
        amount: Number(p.amount),
        currency: p.currency,
        transactionRef: p.transactionRef,
        checkoutUrl: p.checkoutUrl,
        qrCodeUrl: p.qrCodeUrl,
        expiresAt: p.expiresAt,
        metadata: p.metadata,
        status: p.status,
        createdAt: p.createdAt,
        paidAt: p.paidAt
      })),
      enrollmentCount: o._count.enrollments,
      paymentTransactionCount: o._count.paymentTransactions
    }))

    return [records, total]
  }

  async getOrderById(orderId: string): Promise<AdminOrderDetailRecord | null> {
    const o = await prisma.order.findUnique({
      where: {
        id: orderId
      },
      select: detailSelect
    })

    if (!o) return null

    return {
      id: o.id,
      orderInvoiceNumber: o.orderInvoiceNumber,
      totalAmount: Number(o.totalAmount),
      currency: o.currency,
      status: o.status,
      expiresAt: o.expiresAt,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      user: o.user,
      items: o.items.map((i) => ({
        id: i.id,
        courseId: i.courseId,
        priceAtPurchase: Number(i.priceAtPurchase),
        course: i.course
      })),
      payments: o.payments.map((p) => ({
        id: p.id,
        provider: p.provider,
        providerPaymentId: p.providerPaymentId,
        amount: Number(p.amount),
        currency: p.currency,
        transactionRef: p.transactionRef,
        checkoutUrl: p.checkoutUrl,
        qrCodeUrl: p.qrCodeUrl,
        expiresAt: p.expiresAt,
        metadata: p.metadata,
        status: p.status,
        createdAt: p.createdAt,
        paidAt: p.paidAt
      })),
      enrollmentCount: o._count.enrollments,
      paymentTransactionCount: o._count.paymentTransactions,
      paymentTransactions: o.paymentTransactions.map((tx) => ({
        id: tx.id,
        provider: tx.provider,
        providerEventId: tx.providerEventId,
        transactionRef: tx.transactionRef,
        orderInvoiceNumber: tx.orderInvoiceNumber,
        amount: Number(tx.amount),
        currency: tx.currency,
        direction: tx.direction as 'inbound' | 'outbound',
        transactionDate: tx.transactionDate,
        matchStatus: tx.matchStatus,
        metadata: tx.metadata,
        createdAt: tx.createdAt,
        paymentId: tx.paymentId
      })),
      enrollments: o.enrollments.map((en) => ({
        id: en.id,
        userId: en.userId,
        courseId: en.courseId,
        source: en.source,
        manualReason: en.manualReason,
        enrolledAt: en.enrolledAt
      }))
    }
  }
}

export const adminOrderRepository = new PrismaAdminOrderRepository()
