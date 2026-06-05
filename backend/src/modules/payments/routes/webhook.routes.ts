import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'

import { paymentWebhookController } from '../controllers/webhook.controller'

export const paymentWebhookRoutes = Router()

paymentWebhookRoutes.post('/:provider', asyncHandler(paymentWebhookController))
