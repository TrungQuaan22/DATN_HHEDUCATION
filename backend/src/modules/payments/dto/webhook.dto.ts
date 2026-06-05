export type NormalizedPaymentEvent = {
  provider: string
  eventId: string
  transactionRef: string
  orderInvoiceNumber: string | null
  amount: number
  currency: 'VND'
  status: 'success' | 'failed' | 'cancelled'
  direction: 'in' | 'out'
  paidAt: Date | null
  gateway: string | null
  accountNumber: string | null
  rawPayload: unknown
}
