import z from 'zod'

import { PAYMENT_PROVIDERS } from '~/modules/payments/constants'

export const createOrderSchema = z.object({
  body: z
    .object({
      courseIds: z.array(z.string().uuid()).min(1).max(20)
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
})

export const getOrderSchema = z.object({
  body: z.object({}).optional(),
  params: z
    .object({
      orderId: z.string().uuid()
    })
    .strict(),
  query: z.object({}).optional()
})

export const cancelOrderSchema = getOrderSchema

export const createPaymentAttemptSchema = z.object({
  body: z
    .object({
      provider: z.enum(PAYMENT_PROVIDERS)
    })
    .strict(),
  params: z
    .object({
      orderId: z.string().uuid()
    })
    .strict(),
  query: z.object({}).optional()
})
