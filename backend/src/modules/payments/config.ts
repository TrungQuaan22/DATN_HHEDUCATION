import { DEFAULT_PAYMENT_PROVIDER, PAYMENT_PROVIDER } from './constants'

const getOptionalEnv = (key: string) => {
  const value = process.env[key]
  return value && value.trim() ? value.trim() : undefined
}

const getNumberEnv = (key: string, fallback: number) => {
  const value = getOptionalEnv(key)
  if (!value) return fallback

  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const paymentConfig = {
  defaultProvider: getOptionalEnv('PAYMENT_DEFAULT_PROVIDER') ?? DEFAULT_PAYMENT_PROVIDER,
  pendingTtlMinutes: getNumberEnv('PAYMENT_PENDING_TTL_MINUTES', 15),
  idempotencyTtlHours: getNumberEnv('IDEMPOTENCY_KEY_TTL_HOURS', 24),
  idempotencyStaleMinutes: getNumberEnv('IDEMPOTENCY_KEY_STALE_MINUTES', 5)
}

export const sepayConfig = {
  provider: PAYMENT_PROVIDER.SEPAY,
  webhookAuthMode: getOptionalEnv('SEPAY_WEBHOOK_AUTH_MODE') ?? 'hmac',
  webhookSecret: getOptionalEnv('SEPAY_WEBHOOK_SECRET'),
  apiKey: getOptionalEnv('SEPAY_API_KEY'),
  bankAccountNumber: getOptionalEnv('SEPAY_BANK_ACCOUNT_NUMBER'),
  bankCode: getOptionalEnv('SEPAY_BANK_CODE'),
  qrBaseUrl: getOptionalEnv('SEPAY_QR_BASE_URL') ?? 'https://qr.sepay.vn/img',
  paymentCodePrefix: getOptionalEnv('SEPAY_PAYMENT_CODE_PREFIX') ?? 'HHE',
  paymentCodeSuffixLength: getNumberEnv('SEPAY_PAYMENT_CODE_SUFFIX_LENGTH', 12)
}
