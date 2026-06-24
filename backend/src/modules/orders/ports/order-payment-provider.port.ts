import type { PaymentProviderName } from '~/modules/payments/constants'

export type CreateOrderPaymentInput = {
  orderInvoiceNumber: string
  amount: number
  expiresAt: Date
}

export type OrderProviderPayment = {
  provider: string
  providerPaymentId: string
  qrCodeUrl: string | null
  checkoutUrl: string | null
  expiresAt: Date | null
}

export interface OrderPaymentProviderPort {
  createPayment(
    providerName: PaymentProviderName,
    input: CreateOrderPaymentInput
  ): OrderProviderPayment
}
