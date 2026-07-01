import type { Request, Response } from 'express'

import { getPaymentProvider } from '../providers/provider.factory'
import { webhookService } from '../wiring'

export const paymentWebhookController = async (req: Request, res: Response) => {
  const provider = getPaymentProvider(req.params.provider as string)
  const event = provider.verifyWebhook(req)
  await webhookService.processPaymentEvent(event)

  res.status(200).json({ success: true })
}
