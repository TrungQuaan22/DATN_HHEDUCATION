import type { Prisma } from '@prisma/client'

import type {
  AdminPaymentTransactionDetailDto,
  AdminPaymentTransactionListItemDto
} from '../dto'

export interface AdminPaymentTransactionRepositoryPort {
  listTransactions(data: {
    where: Prisma.PaymentTransactionWhereInput
    skip: number
    take: number
  }): Promise<[AdminPaymentTransactionListItemDto[], number]>
  getTransactionById(transactionId: string): Promise<AdminPaymentTransactionDetailDto | null>
}
