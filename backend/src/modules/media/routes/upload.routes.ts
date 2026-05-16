import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireAuth } from '~/common/middlewares/require-auth'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  completeUploadController,
  createUploadController
} from '../controllers/upload.controller'
import {
  completeUploadSchema,
  createPresignedUploadSchema
} from '../validators/admin.validator'

export const uploadRoutes = Router()

uploadRoutes.post(
  '/presign',
  requireAuth,
  validateRequest(createPresignedUploadSchema),
  asyncHandler(createUploadController)
)

uploadRoutes.post(
  '/complete',
  requireAuth,
  validateRequest(completeUploadSchema),
  asyncHandler(completeUploadController)
)
