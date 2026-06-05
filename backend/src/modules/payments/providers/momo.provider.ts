import type { Request } from 'express'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

import { PaymentProvider } from './provider.interface'
import type { NormalizedPaymentEvent } from '../dto'

export const momoProvider: PaymentProvider = {
  createPayment(input) {
    console.log('[payments:momo] createPayment placeholder', input)
    throw new AppError(501, ERROR_CODE.INTERNAL_SERVER_ERROR, 'Momo provider is not implemented')
  },

  verifyWebhook(req: Request): NormalizedPaymentEvent {
    console.log('[payments:momo] verifyWebhook placeholder', req.body)
    throw new AppError(501, ERROR_CODE.INTERNAL_SERVER_ERROR, 'Momo webhook is not implemented')
  }
}
