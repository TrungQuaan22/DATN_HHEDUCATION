import { AppError } from '~/common/error/app-error'
import { ERROR_CODE } from '~/common/constant/error-code'
import type { AdminPaymentTransactionRepositoryPort } from '../ports/admin-payment-transaction-repository.port'
import type {
  AdminPaymentTransactionDetailResponse,
  ListAdminPaymentTransactionsDto,
  ListAdminPaymentTransactionsResponse
} from '../dto'
import {
  mapAdminPaymentTransactionDetail,
  mapAdminPaymentTransactionListItem
} from '../mappers/admin-payment-transaction.mapper'

export class AdminPaymentTransactionService {
  constructor(private readonly transactionRepository: AdminPaymentTransactionRepositoryPort) {}

  async listTransactions(
    input: ListAdminPaymentTransactionsDto
  ): Promise<ListAdminPaymentTransactionsResponse> {
    const [items, totalItems] = await this.transactionRepository.listTransactions({
      filters: {
        provider: input.provider,
        matchStatus: input.matchStatus,
        direction: input.direction,
        orderId: input.orderId,
        paymentId: input.paymentId,
        orderInvoiceNumber: input.orderInvoiceNumber,
        transactionRef: input.transactionRef,
        createdFrom: input.createdFrom,
        createdTo: input.createdTo,
        search: input.search
      },
      page: input.page,
      limit: input.limit
    })

    return {
      items: items.map(mapAdminPaymentTransactionListItem),
      pagination: {
        page: input.page,
        limit: input.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / input.limit)
      }
    }
  }

  async getTransaction(transactionId: string): Promise<AdminPaymentTransactionDetailResponse> {
    const transaction = await this.transactionRepository.getTransactionById(transactionId)

    if (!transaction) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Payment transaction not found')
    }

    return mapAdminPaymentTransactionDetail(transaction)
  }
}
