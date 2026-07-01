import type { OrderRecord } from '../ports/order-repository.port'
import type { OrderResponse } from '../dto'

export function mapOrder(order: OrderRecord): OrderResponse {
  const payment = order.payments[0] ?? null

  return {
    id: order.id,
    orderInvoiceNumber: order.orderInvoiceNumber,
    totalAmount: Number(order.totalAmount),
    currency: order.currency,
    status: order.status,
    expiresAt: order.expiresAt,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      courseId: item.courseId,
      title: item.course.title,
      slug: item.course.slug,
      priceAtPurchase: Number(item.priceAtPurchase)
    })),
    payment: payment
      ? {
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
      : null
  }
}
