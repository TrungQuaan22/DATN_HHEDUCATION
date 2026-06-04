import { Prisma } from '@prisma/client'

import type { OrderDto } from '../dto'

export const ORDER_SELECT = {
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

export type OrderRow = Prisma.OrderGetPayload<{ select: typeof ORDER_SELECT }>

export const mapOrder = (order: OrderRow): OrderDto => {
  const payment = order.payments[0] ?? null

  return {
    id: order.id,
    orderInvoiceNumber: order.orderInvoiceNumber,
    totalAmount: order.totalAmount,
    currency: order.currency,
    status: order.status,
    expiresAt: order.expiresAt,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      courseId: item.courseId,
      title: item.course.title,
      slug: item.course.slug,
      priceAtPurchase: item.priceAtPurchase
    })),
    payment: payment
      ? {
          id: payment.id,
          provider: payment.provider,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          qrCodeUrl: payment.qrCodeUrl,
          checkoutUrl: payment.checkoutUrl,
          expiresAt: payment.expiresAt,
          paidAt: payment.paidAt
        }
      : null
  }
}
