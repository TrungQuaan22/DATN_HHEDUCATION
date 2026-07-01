import type { OrderStatus, PaymentStatus } from '../ports/order-repository.port'

import type { PaymentProviderName } from '~/modules/payments/constants'

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
  provider: PaymentProviderName
}

export type OrderPaymentResponse = {
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

export type OrderItemResponse = {
  id: string
  courseId: string
  title: string
  slug: string
  priceAtPurchase: number
}

export type OrderResponse = {
  id: string
  orderInvoiceNumber: string
  totalAmount: number
  currency: string
  status: OrderStatus
  expiresAt: Date
  createdAt: Date
  items: OrderItemResponse[]
  payment: OrderPaymentResponse | null
}

export type CreateOrderResponse =
  | {
      code: 'ORDER_CREATED' | 'FREE_ORDER_COMPLETED'
      order: OrderResponse
    }
  | {
      code: 'PENDING_ORDER_EXISTS'
      order: OrderResponse
    }

export type CancelOrderResponse = {
  order: OrderResponse
}

export type CreatePaymentAttemptResponse = {
  order: OrderResponse
}
