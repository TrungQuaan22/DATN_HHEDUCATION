import { OrderStatus, PaymentStatus } from '@prisma/client'
import z from 'zod'

const orderIdParamSchema = z
  .object({
    orderId: z.string().uuid()
  })
  .strict()

export const listAdminOrdersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.nativeEnum(OrderStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    provider: z.string().trim().min(1).max(50).optional(),
    userId: z.string().uuid().optional(),
    search: z.string().trim().min(1).max(100).optional(),
    createdFrom: z.coerce.date().optional(),
    createdTo: z.coerce.date().optional()
  })
  .strict()

export const listAdminOrdersSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: listAdminOrdersQuerySchema
})

export const getAdminOrderSchema = z.object({
  body: z.object({}).optional(),
  params: orderIdParamSchema,
  query: z.object({}).optional()
})
