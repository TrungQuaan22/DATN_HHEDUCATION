import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireAuth } from '~/common/middlewares/require-auth'
import { requireRole } from '~/common/middlewares/require-role'
import { validateRequest } from '~/common/middlewares/validate-request'

import { createTeacherController, getAllUsersController, updateUserStatusController } from '../controllers/admin.controller'
import { createTeacherSchema, listUsersSchema, updateUserStatusSchema } from '../validators/admin.validator'

export const adminUserRoutes = Router()

adminUserRoutes.post(
  '/teachers',
  requireAuth,
  requireRole(UserRole.admin),
  validateRequest(createTeacherSchema),
  asyncHandler(createTeacherController)
)

adminUserRoutes.get(
  '/users',
  requireAuth,
  requireRole(UserRole.admin),
  validateRequest(listUsersSchema),
  asyncHandler(getAllUsersController)
)

adminUserRoutes.patch(
  '/users/:userId/status',
  requireAuth,
  requireRole(UserRole.admin),
  validateRequest(updateUserStatusSchema),
  asyncHandler(updateUserStatusController)
)
