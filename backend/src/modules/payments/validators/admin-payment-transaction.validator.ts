import {
  PaymentTransactionDirection,
  PaymentTransactionMatchStatus
} from '@prisma/client'
import z from 'zod'

const transactionIdParamSchema = z
  .object({
    transactionId: z.string().uuid()
  })
  .strict()

export const listAdminPaymentTransactionsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    provider: z.string().trim().min(1).max(50).optional(),
    matchStatus: z.nativeEnum(PaymentTransactionMatchStatus).optional(),
    direction: z.nativeEnum(PaymentTransactionDirection).optional(),
    orderId: z.string().uuid().optional(),
    paymentId: z.string().uuid().optional(),
    orderInvoiceNumber: z.string().trim().min(1).max(50).optional(),
    transactionRef: z.string().trim().min(1).max(255).optional(),
    search: z.string().trim().min(1).max(100).optional(),
    createdFrom: z.coerce.date().optional(),
    createdTo: z.coerce.date().optional()
  })
  .strict()

export const listAdminPaymentTransactionsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: listAdminPaymentTransactionsQuerySchema
})

export const getAdminPaymentTransactionSchema = z.object({
  body: z.object({}).optional(),
  params: transactionIdParamSchema,
  query: z.object({}).optional()
})
