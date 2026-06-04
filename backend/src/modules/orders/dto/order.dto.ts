import type { OrderStatus, PaymentStatus } from '@prisma/client'

export type CreateOrderDto = {
  userId: string
  courseIds: string[]
}

export type CancelOrderDto = {
  userId: string
  orderId: string
}

export type CreatePaymentAttemptDto = {
  userId: string
  orderId: string
  provider: string
}

export type OrderPaymentDto = {
  id: string
  provider: string
  amount: number
  currency: string
  status: PaymentStatus
  qrCodeUrl: string | null
  checkoutUrl: string | null
  expiresAt: Date | null
  paidAt: Date | null
}

export type OrderItemDto = {
  id: string
  courseId: string
  title: string
  slug: string
  priceAtPurchase: number
}

export type OrderDto = {
  id: string
  orderInvoiceNumber: string
  totalAmount: number
  currency: string
  status: OrderStatus
  expiresAt: Date
  createdAt: Date
  items: OrderItemDto[]
  payment: OrderPaymentDto | null
}

export type CreateOrderResponseDto =
  | {
      code: 'ORDER_CREATED' | 'FREE_ORDER_COMPLETED'
      order: OrderDto
    }
  | {
      code: 'PENDING_ORDER_EXISTS'
      order: OrderDto
    }

export type CancelOrderResponseDto = {
  order: OrderDto
}

export type CreatePaymentAttemptResponseDto = {
  order: OrderDto
}
