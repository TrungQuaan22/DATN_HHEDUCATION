import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireActiveSession } from '~/common/middlewares/require-active-session'
import { requireAuth } from '~/common/middlewares/require-auth'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  completeUploadController,
  createUploadController
} from '../controllers/upload.controller'
import {
  completeUploadSchema,
  createPresignedUploadSchema
} from '../validators/upload.validator'

export const uploadRoutes = Router()

uploadRoutes.post(
  '/presign',
  requireAuth,
  requireActiveSession,
  validateRequest(createPresignedUploadSchema),
  asyncHandler(createUploadController)
)

uploadRoutes.post(
  '/complete',
  requireAuth,
  requireActiveSession,
  validateRequest(completeUploadSchema),
  asyncHandler(completeUploadController)
)
