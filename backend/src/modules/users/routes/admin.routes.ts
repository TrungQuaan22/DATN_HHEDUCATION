import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireActiveSession } from '~/common/middlewares/require-active-session'
import { requireAuth } from '~/common/middlewares/require-auth'
import { requireRole } from '~/common/middlewares/require-role'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  createTeacherController,
  getAllUsersController,
  listTeacherOptionsController,
  updateUserStatusController
} from '../controllers/admin.controller'
import {
  createTeacherSchema,
  listTeacherOptionsSchema,
  listUsersSchema,
  updateUserStatusSchema
} from '../validators/admin.validator'

export const adminUserRoutes = Router()

adminUserRoutes.post(
  '/teachers',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin),
  validateRequest(createTeacherSchema),
  asyncHandler(createTeacherController)
)

adminUserRoutes.get(
  '/teachers/options',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(listTeacherOptionsSchema),
  asyncHandler(listTeacherOptionsController)
)

adminUserRoutes.get(
  '/users',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin),
  validateRequest(listUsersSchema),
  asyncHandler(getAllUsersController)
)

adminUserRoutes.patch(
  '/users/:userId/status',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin),
  validateRequest(updateUserStatusSchema),
  asyncHandler(updateUserStatusController)
)
