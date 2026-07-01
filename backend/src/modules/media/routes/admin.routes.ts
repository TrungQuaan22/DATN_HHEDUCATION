import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireAuth } from '~/common/middlewares/require-auth'
import { requireRole } from '~/common/middlewares/require-role'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  completeUploadController,
  createPresignedUploadController
} from '../controllers/admin.controller'
import {
  completeUploadSchema,
  createPresignedUploadSchema
} from '../validators/admin.validator'

export const adminMediaRoutes = Router()

adminMediaRoutes.post(
  '/uploads/presign',
  requireAuth,
  requireRole(UserRole.admin),
  validateRequest(createPresignedUploadSchema),
  asyncHandler(createPresignedUploadController)
)

adminMediaRoutes.post(
  '/uploads/complete',
  requireAuth,
  requireRole(UserRole.admin),
  validateRequest(completeUploadSchema),
  asyncHandler(completeUploadController)
)
