/* eslint-disable @typescript-eslint/no-explicit-any */
import type { OrderStatus, PaymentStatus } from '../ports/order-repository.port'
import z from 'zod'

import type { listAdminOrdersQuerySchema } from '../validators/admin-order.validator'

export type ListAdminOrdersDto = z.infer<typeof listAdminOrdersQuerySchema>

export type AdminOrderPaymentResponse = {
  id: string
  provider: string
  providerPaymentId: string | null
  amount: number
  currency: string
  transactionRef: string | null
  checkoutUrl: string | null
  qrCodeUrl: string | null
  expiresAt: Date | null
  metadata: any
  status: PaymentStatus
  createdAt: Date
  paidAt: Date | null
}

export type AdminOrderCourseResponse = {
  title: string
  slug: string
}

export type AdminOrderItemResponse = {
  id: string
  courseId: string
  priceAtPurchase: number
  course: AdminOrderCourseResponse
}

export type AdminOrderUserResponse = {
  id: string
  email: string
  fullName: string
}

export type AdminOrderListItemResponse = {
  id: string
  orderInvoiceNumber: string
  totalAmount: number
  currency: string
  status: OrderStatus
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  user: AdminOrderUserResponse
  items: AdminOrderItemResponse[]
  payments: AdminOrderPaymentResponse[]
  enrollmentCount: number
  paymentTransactionCount: number
}

export type AdminOrderDetailResponse = AdminOrderListItemResponse & {
  paymentTransactions: Array<{
    id: string
    provider: string
    providerEventId: string | null
    transactionRef: string | null
    orderInvoiceNumber: string | null
    amount: number
    currency: string
    direction: 'inbound' | 'outbound'
    transactionDate: Date | null
    matchStatus: string
    metadata: any
    createdAt: Date
    paymentId: string | null
  }>
  enrollments: Array<{
    id: string
    userId: string
    courseId: string
    source: string
    manualReason: string | null
    enrolledAt: Date
  }>
}

export type ListAdminOrdersResponse = {
  items: AdminOrderListItemResponse[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}
