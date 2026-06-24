import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireAuth } from '~/common/middlewares/require-auth'
import { requireRole } from '~/common/middlewares/require-role'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  createTutorSessionController,
  getTutorSessionDetailController,
  listTutorSessionsController,
  sendTutorMessageController,
  sendTutorMessageStreamController
} from './controller'
import {
  createTutorSessionSchema,
  listTutorSessionsSchema,
  sendTutorMessageSchema,
  tutorSessionIdSchema
} from './validators/tutor.validator'

export const tutorRoutes = Router()

tutorRoutes.get(
  '/tutor/sessions',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(listTutorSessionsSchema),
  asyncHandler(listTutorSessionsController)
)

tutorRoutes.post(
  '/tutor/sessions',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(createTutorSessionSchema),
  asyncHandler(createTutorSessionController)
)

tutorRoutes.get(
  '/tutor/sessions/:sessionId',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(tutorSessionIdSchema),
  asyncHandler(getTutorSessionDetailController)
)

tutorRoutes.post(
  '/tutor/sessions/:sessionId/messages',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(sendTutorMessageSchema),
  asyncHandler(sendTutorMessageController)
)

tutorRoutes.post(
  '/tutor/sessions/:sessionId/messages/stream',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(sendTutorMessageSchema),
  asyncHandler(sendTutorMessageStreamController)
)
