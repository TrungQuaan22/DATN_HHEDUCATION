import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireAuth } from '~/common/middlewares/require-auth'
import { requireRole } from '~/common/middlewares/require-role'
import { validateRequest } from '~/common/middlewares/validate-request'
import { parseIdempotency } from '~/common/middlewares/idempotency.middleware'

import {
  cancelOrderController,
  createPaymentAttemptController,
  createOrderController,
  getOrderController
} from '../controllers/order.controller'
import {
  cancelOrderSchema,
  createPaymentAttemptSchema,
  createOrderSchema,
  getOrderSchema
} from '../validators/order.validator'

export const orderRoutes = Router()

orderRoutes.post(
  '/',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(createOrderSchema),
  parseIdempotency('order.create'),
  asyncHandler(createOrderController)
)

orderRoutes.get(
  '/:orderId',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(getOrderSchema),
  asyncHandler(getOrderController)
)

orderRoutes.post(
  '/:orderId/payments',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(createPaymentAttemptSchema),
  parseIdempotency('order.payment.create'),
  asyncHandler(createPaymentAttemptController)
)

orderRoutes.post(
  '/:orderId/cancel',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(cancelOrderSchema),
  parseIdempotency('order.cancel'),
  asyncHandler(cancelOrderController)
)
