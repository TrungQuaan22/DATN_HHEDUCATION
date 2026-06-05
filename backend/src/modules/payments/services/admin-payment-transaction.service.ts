import type { Prisma } from '@prisma/client'

import { AppError } from '~/common/error/app-error'
import { ERROR_CODE } from '~/common/constant/error-code'
import { adminPaymentTransactionRepository } from '../repositories/admin-payment-transaction.repository'
import type { AdminPaymentTransactionRepositoryPort } from '../ports/admin-payment-transaction-repository.port'
import type {
  AdminPaymentTransactionDetailDto,
  ListAdminPaymentTransactionsDto,
  ListAdminPaymentTransactionsResponseDto
} from '../dto'

const buildPaymentTransactionWhere = (
  input: ListAdminPaymentTransactionsDto
): Prisma.PaymentTransactionWhereInput => {
  const where: Prisma.PaymentTransactionWhereInput = {
    provider: input.provider,
    matchStatus: input.matchStatus,
    direction: input.direction,
    orderId: input.orderId,
    paymentId: input.paymentId,
    orderInvoiceNumber: input.orderInvoiceNumber,
    transactionRef: input.transactionRef
  }

  if (input.createdFrom || input.createdTo) {
    where.createdAt = {
      gte: input.createdFrom,
      lte: input.createdTo
    }
  }

  if (input.search) {
    where.OR = [
      {
        orderInvoiceNumber: {
          contains: input.search,
          mode: 'insensitive'
        }
      },
      {
        transactionRef: {
          contains: input.search,
          mode: 'insensitive'
        }
      },
      {
        providerEventId: {
          contains: input.search,
          mode: 'insensitive'
        }
      },
      {
        order: {
          user: {
            email: {
              contains: input.search,
              mode: 'insensitive'
            }
          }
        }
      },
      {
        order: {
          user: {
            fullName: {
              contains: input.search,
              mode: 'insensitive'
            }
          }
        }
      }
    ]
  }

  return where
}

export class AdminPaymentTransactionService {
  constructor(private readonly transactionRepository: AdminPaymentTransactionRepositoryPort) {}

  async listTransactions(
    input: ListAdminPaymentTransactionsDto
  ): Promise<ListAdminPaymentTransactionsResponseDto> {
    const where = buildPaymentTransactionWhere(input)
    const skip = (input.page - 1) * input.limit

    const [items, totalItems] = await this.transactionRepository.listTransactions({
      where,
      skip,
      take: input.limit
    })

    return {
      items,
      pagination: {
        page: input.page,
        limit: input.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / input.limit)
      }
    }
  }

  async getTransaction(transactionId: string): Promise<AdminPaymentTransactionDetailDto> {
    const transaction = await this.transactionRepository.getTransactionById(transactionId)

    if (!transaction) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Payment transaction not found')
    }

    return transaction
  }
}

export const adminPaymentTransactionService = new AdminPaymentTransactionService(
  adminPaymentTransactionRepository
)
