import type { Prisma } from '@prisma/client'
import z from 'zod'

import type { listAdminOrdersQuerySchema } from '../validators/admin-order.validator'

export type ListAdminOrdersDto = z.infer<typeof listAdminOrdersQuerySchema>

export const ADMIN_ORDER_PAYMENT_SELECT = {
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
} satisfies Prisma.PaymentSelect

export const ADMIN_ORDER_LIST_SELECT = {
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
    select: ADMIN_ORDER_PAYMENT_SELECT,
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

export const ADMIN_ORDER_DETAIL_SELECT = {
  ...ADMIN_ORDER_LIST_SELECT,
  payments: {
    select: ADMIN_ORDER_PAYMENT_SELECT,
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

export type AdminOrderListItemDto = Prisma.OrderGetPayload<{
  select: typeof ADMIN_ORDER_LIST_SELECT
}>

export type AdminOrderDetailDto = Prisma.OrderGetPayload<{
  select: typeof ADMIN_ORDER_DETAIL_SELECT
}>

export type ListAdminOrdersResponseDto = {
  items: AdminOrderListItemDto[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}
