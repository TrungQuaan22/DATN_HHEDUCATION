export const PAYMENT_PROVIDER = {
  SEPAY: 'sepay',
  MOMO: 'momo',
  VNPAY: 'vnpay'
} as const

// Lấy type = union của các value của PAYMENT_PROVIDER, ví dụ: 'sepay' | 'momo' | 'vnpay'
export type PaymentProviderName =
  (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER]

  // Lấy array của các value của PAYMENT_PROVIDER, ví dụ: ['sepay', 'momo', 'vnpay']
export const PAYMENT_PROVIDERS = Object.values(PAYMENT_PROVIDER) as [
  PaymentProviderName,
  ...PaymentProviderName[]
]

export const DEFAULT_PAYMENT_PROVIDER: PaymentProviderName = PAYMENT_PROVIDER.SEPAY
