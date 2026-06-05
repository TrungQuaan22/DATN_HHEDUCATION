import type { Prisma } from '@prisma/client'
import z from 'zod'

import type { listAdminPaymentTransactionsQuerySchema } from '../validators/admin-payment-transaction.validator'

export type ListAdminPaymentTransactionsDto = z.infer<
  typeof listAdminPaymentTransactionsQuerySchema
>

export const ADMIN_PAYMENT_TRANSACTION_LIST_SELECT = {
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
  orderId: true,
  paymentId: true,
  order: {
    select: {
      id: true,
      orderInvoiceNumber: true,
      status: true,
      totalAmount: true,
      user: {
        select: {
          id: true,
          email: true,
          fullName: true
        }
      }
    }
  },
  payment: {
    select: {
      id: true,
      provider: true,
      status: true,
      amount: true,
      currency: true,
      paidAt: true
    }
  }
} satisfies Prisma.PaymentTransactionSelect

export const ADMIN_PAYMENT_TRANSACTION_DETAIL_SELECT = {
  ...ADMIN_PAYMENT_TRANSACTION_LIST_SELECT,
  rawPayload: true
} satisfies Prisma.PaymentTransactionSelect

export type AdminPaymentTransactionListItemDto = Prisma.PaymentTransactionGetPayload<{
  select: typeof ADMIN_PAYMENT_TRANSACTION_LIST_SELECT
}>

export type AdminPaymentTransactionDetailDto = Prisma.PaymentTransactionGetPayload<{
  select: typeof ADMIN_PAYMENT_TRANSACTION_DETAIL_SELECT
}>

export type ListAdminPaymentTransactionsResponseDto = {
  items: AdminPaymentTransactionListItemDto[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}
