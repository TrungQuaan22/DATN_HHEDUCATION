import type {
  PaymentTransactionDirection,
  PaymentTransactionMatchStatus,
  Prisma
} from '@prisma/client'

import type { OrderStatus, PaymentStatus } from '~/modules/orders/ports/order-repository.port'

export type { PaymentTransactionDirection, PaymentTransactionMatchStatus }

export type ListAdminPaymentTransactionsFilters = {
  provider?: string
  matchStatus?: PaymentTransactionMatchStatus
  direction?: PaymentTransactionDirection
  orderId?: string
  paymentId?: string
  orderInvoiceNumber?: string
  transactionRef?: string
  createdFrom?: Date
  createdTo?: Date
  search?: string
}

export type AdminPaymentTransactionListItemRecord = {
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

export type AdminPaymentTransactionDetailRecord = AdminPaymentTransactionListItemRecord & {
  rawPayload: Prisma.JsonValue
}

export interface AdminPaymentTransactionRepositoryPort {
  listTransactions(data: {
    filters: ListAdminPaymentTransactionsFilters
    page: number
    limit: number
  }): Promise<[AdminPaymentTransactionListItemRecord[], number]>
  getTransactionById(transactionId: string): Promise<AdminPaymentTransactionDetailRecord | null>
}
