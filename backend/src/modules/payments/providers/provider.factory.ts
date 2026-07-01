import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

import { PAYMENT_PROVIDER, type PaymentProviderName } from '../constants'
import { momoProvider } from './momo.provider'
import type { PaymentProvider } from './provider.interface'
import { sepayProvider } from './sepay.provider'
import { vnpayProvider } from './vnpay.provider'

const providers: Record<PaymentProviderName, PaymentProvider> = {
  [PAYMENT_PROVIDER.SEPAY]: sepayProvider,
  [PAYMENT_PROVIDER.MOMO]: momoProvider,
  [PAYMENT_PROVIDER.VNPAY]: vnpayProvider
}

export const getPaymentProvider = (name: string): PaymentProvider => {
  const provider = providers[name.toLowerCase() as PaymentProviderName]

  if (!provider) {
    throw new AppError(
      500,
      ERROR_CODE.INTERNAL_SERVER_ERROR,
      `Payment provider '${name}' is not supported`
    )
  }

  return provider
}
