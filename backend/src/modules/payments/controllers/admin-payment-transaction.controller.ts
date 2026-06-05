import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import { adminPaymentTransactionService } from '../services/admin-payment-transaction.service'
import {
  getAdminPaymentTransactionSchema,
  listAdminPaymentTransactionsSchema
} from '../validators/admin-payment-transaction.validator'

type ListAdminPaymentTransactionsValidated = z.infer<
  typeof listAdminPaymentTransactionsSchema
>
type GetAdminPaymentTransactionValidated = z.infer<
  typeof getAdminPaymentTransactionSchema
>

export class AdminPaymentTransactionController {
  constructor(private readonly service = adminPaymentTransactionService) {}

  listTransactions = async (req: Request, res: Response) => {
    const validated = req.validated as ListAdminPaymentTransactionsValidated
    const data = await this.service.listTransactions(validated.query)

    sendSuccess({ res, data })
  }

  getTransaction = async (req: Request, res: Response) => {
    const validated = req.validated as GetAdminPaymentTransactionValidated
    const data = await this.service.getTransaction(validated.params.transactionId)

    sendSuccess({ res, data })
  }
}

export const adminPaymentTransactionController = new AdminPaymentTransactionController(
  adminPaymentTransactionService
)

export const listAdminPaymentTransactionsController =
  adminPaymentTransactionController.listTransactions
export const getAdminPaymentTransactionController = adminPaymentTransactionController.getTransaction
