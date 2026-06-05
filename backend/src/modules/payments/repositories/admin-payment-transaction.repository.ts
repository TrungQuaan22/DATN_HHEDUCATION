import { prisma } from '~/config/db'

import {
  ADMIN_PAYMENT_TRANSACTION_DETAIL_SELECT,
  ADMIN_PAYMENT_TRANSACTION_LIST_SELECT
} from '../dto'
import type { AdminPaymentTransactionRepositoryPort } from '../ports/admin-payment-transaction-repository.port'

export class PrismaAdminPaymentTransactionRepository
  implements AdminPaymentTransactionRepositoryPort
{
  async listTransactions(data: Parameters<AdminPaymentTransactionRepositoryPort['listTransactions']>[0]) {
    return prisma.$transaction([
      prisma.paymentTransaction.findMany({
        where: data.where,
        select: ADMIN_PAYMENT_TRANSACTION_LIST_SELECT,
        orderBy: {
          createdAt: 'desc'
        },
        skip: data.skip,
        take: data.take
      }),
      prisma.paymentTransaction.count({
        where: data.where
      })
    ])
  }

  getTransactionById(transactionId: string) {
    return prisma.paymentTransaction.findUnique({
      where: {
        id: transactionId
      },
      select: ADMIN_PAYMENT_TRANSACTION_DETAIL_SELECT
    })
  }
}

export const adminPaymentTransactionRepository = new PrismaAdminPaymentTransactionRepository()
