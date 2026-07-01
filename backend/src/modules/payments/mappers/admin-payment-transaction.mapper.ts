import type {
  AdminPaymentTransactionListItemRecord,
  AdminPaymentTransactionDetailRecord
} from '../ports/admin-payment-transaction-repository.port'
import type {
  AdminPaymentTransactionListItemResponse,
  AdminPaymentTransactionDetailResponse
} from '../dto/admin-payment-transaction.dto'

export function mapAdminPaymentTransactionListItem(
  record: AdminPaymentTransactionListItemRecord
): AdminPaymentTransactionListItemResponse {
  return {
    id: record.id,
    provider: record.provider,
    providerEventId: record.providerEventId,
    transactionRef: record.transactionRef,
    orderInvoiceNumber: record.orderInvoiceNumber,
    amount: record.amount,
    currency: record.currency,
    direction: record.direction,
    transactionDate: record.transactionDate,
    matchStatus: record.matchStatus,
    metadata: record.metadata,
    createdAt: record.createdAt,
    orderId: record.orderId,
    paymentId: record.paymentId,
    order: record.order
      ? {
          id: record.order.id,
          orderInvoiceNumber: record.order.orderInvoiceNumber,
          status: record.order.status,
          totalAmount: Number(record.order.totalAmount),
          user: {
            id: record.order.user.id,
            email: record.order.user.email,
            fullName: record.order.user.fullName
          }
        }
      : null,
    payment: record.payment
      ? {
          id: record.payment.id,
          provider: record.payment.provider,
          status: record.payment.status,
          amount: Number(record.payment.amount),
          currency: record.payment.currency,
          paidAt: record.payment.paidAt
        }
      : null
  }
}

export function mapAdminPaymentTransactionDetail(
  record: AdminPaymentTransactionDetailRecord
): AdminPaymentTransactionDetailResponse {
  const base = mapAdminPaymentTransactionListItem(record)
  return {
    ...base,
    rawPayload: record.rawPayload
  }
}
