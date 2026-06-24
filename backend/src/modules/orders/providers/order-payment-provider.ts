import { getPaymentProvider } from '~/modules/payments/providers/provider.factory'
import type { PaymentProviderName } from '~/modules/payments/constants'

import type {
  CreateOrderPaymentInput,
  OrderPaymentProviderPort,
  OrderProviderPayment
} from '../ports/order-payment-provider.port'

export class OrderPaymentProvider implements OrderPaymentProviderPort {
  createPayment(
    providerName: PaymentProviderName,
    input: CreateOrderPaymentInput
  ): OrderProviderPayment {
    const provider = getPaymentProvider(providerName)

    return provider.createPayment(input)
  }
}

export const orderPaymentProvider = new OrderPaymentProvider()
