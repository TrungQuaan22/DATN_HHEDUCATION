import type { Request } from 'express'

import type { NormalizedPaymentEvent } from '../dto'

export type CreatePaymentRequest = {
  orderInvoiceNumber: string
  amount: number
  expiresAt: Date
}

export type CreatePaymentResponse = {
  provider: string
  providerPaymentId: string
  qrCodeUrl: string | null
  checkoutUrl: string | null
  expiresAt: Date | null
}

export interface PaymentProvider {
  createPayment(request: CreatePaymentRequest): CreatePaymentResponse
  verifyWebhook(req: Request): NormalizedPaymentEvent
}
