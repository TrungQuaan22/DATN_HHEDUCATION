import type {
  AdminOrderListItemRecord,
  AdminOrderDetailRecord,
  AdminOrderPaymentRecord
} from '../ports/admin-order-repository.port'
import type {
  AdminOrderListItemResponse,
  AdminOrderDetailResponse,
  AdminOrderPaymentResponse
} from '../dto/admin-order.dto'

export function mapAdminOrderPayment(record: AdminOrderPaymentRecord): AdminOrderPaymentResponse {
  return {
    id: record.id,
    provider: record.provider,
    providerPaymentId: record.providerPaymentId,
    amount: Number(record.amount),
    currency: record.currency,
    transactionRef: record.transactionRef,
    checkoutUrl: record.checkoutUrl,
    qrCodeUrl: record.qrCodeUrl,
    expiresAt: record.expiresAt,
    metadata: record.metadata,
    status: record.status,
    createdAt: record.createdAt,
    paidAt: record.paidAt
  }
}

export function mapAdminOrderListItem(
  record: AdminOrderListItemRecord
): AdminOrderListItemResponse {
  return {
    id: record.id,
    orderInvoiceNumber: record.orderInvoiceNumber,
    totalAmount: Number(record.totalAmount),
    currency: record.currency,
    status: record.status,
    expiresAt: record.expiresAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    user: {
      id: record.user.id,
      email: record.user.email,
      fullName: record.user.fullName
    },
    items: record.items.map((item) => ({
      id: item.id,
      courseId: item.courseId,
      priceAtPurchase: Number(item.priceAtPurchase),
      course: {
        title: item.course.title,
        slug: item.course.slug
      }
    })),
    payments: record.payments.map(mapAdminOrderPayment),
    enrollmentCount: record.enrollmentCount,
    paymentTransactionCount: record.paymentTransactionCount
  }
}

export function mapAdminOrderDetail(record: AdminOrderDetailRecord): AdminOrderDetailResponse {
  const base = mapAdminOrderListItem(record)
  return {
    ...base,
    paymentTransactions: record.paymentTransactions.map((tx) => ({
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
      paymentId: tx.paymentId
    })),
    enrollments: record.enrollments.map((en) => ({
      id: en.id,
      userId: en.userId,
      courseId: en.courseId,
      source: en.source,
      manualReason: en.manualReason,
      enrolledAt: en.enrolledAt
    }))
  }
}
