import { prisma } from '~/config/db'
import type { Prisma } from '@prisma/client'
import type {
  AdminPaymentTransactionDetailRecord,
  AdminPaymentTransactionListItemRecord,
  AdminPaymentTransactionRepositoryPort,
  ListAdminPaymentTransactionsFilters
} from '../ports/admin-payment-transaction-repository.port'

const listSelect = {
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

const detailSelect = {
  ...listSelect,
  rawPayload: true
} satisfies Prisma.PaymentTransactionSelect

function buildPaymentTransactionWhere(
  filters: ListAdminPaymentTransactionsFilters
): Prisma.PaymentTransactionWhereInput {
  const where: Prisma.PaymentTransactionWhereInput = {
    provider: filters.provider,
    matchStatus: filters.matchStatus as any,
    direction: filters.direction,
    orderId: filters.orderId,
    paymentId: filters.paymentId,
    orderInvoiceNumber: filters.orderInvoiceNumber,
    transactionRef: filters.transactionRef
  }

  if (filters.createdFrom || filters.createdTo) {
    where.createdAt = {
      gte: filters.createdFrom,
      lte: filters.createdTo
    }
  }

  if (filters.search) {
    where.OR = [
      {
        orderInvoiceNumber: {
          contains: filters.search,
          mode: 'insensitive'
        }
      },
      {
        transactionRef: {
          contains: filters.search,
          mode: 'insensitive'
        }
      },
      {
        providerEventId: {
          contains: filters.search,
          mode: 'insensitive'
        }
      },
      {
        order: {
          user: {
            email: {
              contains: filters.search,
              mode: 'insensitive'
            }
          }
        }
      },
      {
        order: {
          user: {
            fullName: {
              contains: filters.search,
              mode: 'insensitive'
            }
          }
        }
      }
    ]
  }

  return where
}

function mapPrismaToListItemRecord(tx: any): AdminPaymentTransactionListItemRecord {
  return {
    id: tx.id,
    provider: tx.provider,
    providerEventId: tx.providerEventId,
    transactionRef: tx.transactionRef,
    orderInvoiceNumber: tx.orderInvoiceNumber,
    amount: Number(tx.amount),
    currency: tx.currency,
    direction: tx.direction,
    transactionDate: tx.transactionDate,
    matchStatus: tx.matchStatus,
    metadata: tx.metadata,
    createdAt: tx.createdAt,
    orderId: tx.orderId,
    paymentId: tx.paymentId,
    order: tx.order
      ? {
          id: tx.order.id,
          orderInvoiceNumber: tx.order.orderInvoiceNumber,
          status: tx.order.status,
          totalAmount: Number(tx.order.totalAmount),
          user: tx.order.user
        }
      : null,
    payment: tx.payment
      ? {
          id: tx.payment.id,
          provider: tx.payment.provider,
          status: tx.payment.status,
          amount: Number(tx.payment.amount),
          currency: tx.payment.currency,
          paidAt: tx.payment.paidAt
        }
      : null
  }
}

export class PrismaAdminPaymentTransactionRepository
  implements AdminPaymentTransactionRepositoryPort
{
  async listTransactions(data: {
    filters: ListAdminPaymentTransactionsFilters
    skip: number
    take: number
  }): Promise<[AdminPaymentTransactionListItemRecord[], number]> {
    const where = buildPaymentTransactionWhere(data.filters)
    const [txs, total] = await prisma.$transaction([
      prisma.paymentTransaction.findMany({
        where,
        select: listSelect,
        orderBy: {
          createdAt: 'desc'
        },
        skip: data.skip,
        take: data.take
      }),
      prisma.paymentTransaction.count({
        where
      })
    ])

    const records = txs.map(mapPrismaToListItemRecord)
    return [records, total]
  }

  async getTransactionById(transactionId: string): Promise<AdminPaymentTransactionDetailRecord | null> {
    const tx = await prisma.paymentTransaction.findUnique({
      where: {
        id: transactionId
      },
      select: detailSelect
    })

    if (!tx) return null

    const base = mapPrismaToListItemRecord(tx)
    return {
      ...base,
      rawPayload: tx.rawPayload
    }
  }
}

export const adminPaymentTransactionRepository = new PrismaAdminPaymentTransactionRepository()
