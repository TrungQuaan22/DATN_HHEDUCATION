import type { Request } from 'express'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

import { PaymentProvider } from './provider.interface'
import type { NormalizedPaymentEvent } from '../dto'

export const vnpayProvider: PaymentProvider = {
  createPayment(input) {
    console.log('[payments:vnpay] createPayment placeholder', input)
    throw new AppError(501, ERROR_CODE.INTERNAL_SERVER_ERROR, 'VNPay provider is not implemented')
  },

  verifyWebhook(req: Request): NormalizedPaymentEvent {
    console.log('[payments:vnpay] verifyWebhook placeholder', req.query)
    throw new AppError(501, ERROR_CODE.INTERNAL_SERVER_ERROR, 'VNPay webhook is not implemented')
  }
}
