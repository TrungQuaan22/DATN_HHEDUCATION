import type { Prisma } from '@prisma/client'
import z from 'zod'

import type { OrderStatus, PaymentStatus } from '~/modules/orders/ports/order-repository.port'

import type { PaymentTransactionDirection } from '../ports/admin-payment-transaction-repository.port'
import type { listAdminPaymentTransactionsQuerySchema } from '../validators/admin-payment-transaction.validator'

export type ListAdminPaymentTransactionsDto = z.infer<
  typeof listAdminPaymentTransactionsQuerySchema
>

export type AdminPaymentTransactionListItemResponse = {
  id: string
  provider: string
  providerEventId: string | null
  transactionRef: string | null
  orderInvoiceNumber: string | null
  amount: number
  currency: string
  direction: PaymentTransactionDirection
  transactionDate: Date | null
  matchStatus: string
  metadata: Prisma.JsonValue
  createdAt: Date
  orderId: string | null
  paymentId: string | null
  order: {
    id: string
    orderInvoiceNumber: string
    status: OrderStatus
    totalAmount: number
    user: {
      id: string
      email: string
      fullName: string
    }
  } | null
  payment: {
    id: string
    provider: string
    status: PaymentStatus
    amount: number
    currency: string
    paidAt: Date | null
  } | null
}

export type AdminPaymentTransactionDetailResponse = AdminPaymentTransactionListItemResponse & {
  rawPayload: Prisma.JsonValue
}

export type ListAdminPaymentTransactionsResponse = {
  items: AdminPaymentTransactionListItemResponse[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}
