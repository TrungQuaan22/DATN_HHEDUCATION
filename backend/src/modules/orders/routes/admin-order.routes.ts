import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireAuth } from '~/common/middlewares/require-auth'
import { requireRole } from '~/common/middlewares/require-role'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  getAdminOrderController,
  listAdminOrdersController
} from '../controllers/admin-order.controller'
import {
  getAdminOrderSchema,
  listAdminOrdersSchema
} from '../validators/admin-order.validator'

export const adminOrderRoutes = Router()

adminOrderRoutes.get(
  '/orders',
  requireAuth,
  requireRole(UserRole.admin),
  validateRequest(listAdminOrdersSchema),
  asyncHandler(listAdminOrdersController)
)

adminOrderRoutes.get(
  '/orders/:orderId',
  requireAuth,
  requireRole(UserRole.admin),
  validateRequest(getAdminOrderSchema),
  asyncHandler(getAdminOrderController)
)
