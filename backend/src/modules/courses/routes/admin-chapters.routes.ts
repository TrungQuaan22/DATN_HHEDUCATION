import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireActiveSession } from '~/common/middlewares/require-active-session'
import { requireAuth } from '~/common/middlewares/require-auth'
import { requireRole } from '~/common/middlewares/require-role'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  createChapterController,
  deleteChapterController,
  reorderChaptersController,
  updateChapterController
} from '../controllers/admin-chapters.controller'
import {
  createChapterSchema,
  deleteChapterSchema,
  reorderChaptersSchema,
  updateChapterSchema
} from '../validators/admin-chapters.validator'

export const adminChapterRoutes = Router()

adminChapterRoutes.post(
  '/courses/:courseId/chapters',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(createChapterSchema),
  asyncHandler(createChapterController)
)

adminChapterRoutes.patch(
  '/chapters/:chapterId',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(updateChapterSchema),
  asyncHandler(updateChapterController)
)

adminChapterRoutes.delete(
  '/chapters/:chapterId',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(deleteChapterSchema),
  asyncHandler(deleteChapterController)
)

adminChapterRoutes.patch(
  '/courses/:courseId/chapters/reorder',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(reorderChaptersSchema),
  asyncHandler(reorderChaptersController)
)
