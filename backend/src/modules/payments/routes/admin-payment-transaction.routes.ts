import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireAuth } from '~/common/middlewares/require-auth'
import { requireRole } from '~/common/middlewares/require-role'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  getAdminPaymentTransactionController,
  listAdminPaymentTransactionsController
} from '../controllers/admin-payment-transaction.controller'
import {
  getAdminPaymentTransactionSchema,
  listAdminPaymentTransactionsSchema
} from '../validators/admin-payment-transaction.validator'

export const adminPaymentTransactionRoutes = Router()

adminPaymentTransactionRoutes.get(
  '/payment-transactions',
  requireAuth,
  requireRole(UserRole.admin),
  validateRequest(listAdminPaymentTransactionsSchema),
  asyncHandler(listAdminPaymentTransactionsController)
)

adminPaymentTransactionRoutes.get(
  '/payment-transactions/:transactionId',
  requireAuth,
  requireRole(UserRole.admin),
  validateRequest(getAdminPaymentTransactionSchema),
  asyncHandler(getAdminPaymentTransactionController)
)
