import { IdempotencyService } from './idempotency.service'
import { adminPaymentTransactionRepository } from './repositories/admin-payment-transaction.repository'
import { idempotencyRepository } from './repositories/idempotency.repository'
import { paymentWebhookRepository } from './repositories/payment-webhook.repository'
import { AdminPaymentTransactionService } from './services/admin-payment-transaction.service'
import { WebhookService } from './services/webhook.service'

export const adminPaymentTransactionService = new AdminPaymentTransactionService(
  adminPaymentTransactionRepository
)
export const webhookService = new WebhookService(paymentWebhookRepository)
export const idempotencyService = new IdempotencyService(idempotencyRepository)
