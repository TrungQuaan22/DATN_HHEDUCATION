import type { Prisma } from '@prisma/client'

import type { OrderStatus, PaymentStatus } from './order-repository.port'

export type ListAdminOrdersFilters = {
  status?: OrderStatus
  userId?: string
  createdFrom?: Date
  createdTo?: Date
  paymentStatus?: PaymentStatus
  provider?: string
  search?: string
}

export type AdminOrderPaymentRecord = {
  id: string
  provider: string
  providerPaymentId: string | null
  amount: number
  currency: string
  transactionRef: string | null
  checkoutUrl: string | null
  qrCodeUrl: string | null
  expiresAt: Date | null
  metadata: Prisma.JsonValue
  status: PaymentStatus
  createdAt: Date
  paidAt: Date | null
}

export type AdminOrderListItemRecord = {
  id: string
  orderInvoiceNumber: string
  totalAmount: number
  currency: string
  status: OrderStatus
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    email: string
    fullName: string
  }
  items: Array<{
    id: string
    courseId: string
    priceAtPurchase: number
    course: {
      title: string
      slug: string
    }
  }>
  payments: AdminOrderPaymentRecord[]
  enrollmentCount: number
  paymentTransactionCount: number
}

export type AdminOrderDetailRecord = AdminOrderListItemRecord & {
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
    metadata: Prisma.JsonValue
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

export interface AdminOrderRepositoryPort {
  listOrders(data: {
    filters: ListAdminOrdersFilters
    page: number
    limit: number
  }): Promise<[AdminOrderListItemRecord[], number]>
  getOrderById(orderId: string): Promise<AdminOrderDetailRecord | null>
}
