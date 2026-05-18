import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireAuth } from '~/common/middlewares/require-auth'
import { requireRole } from '~/common/middlewares/require-role'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  createLessonController,
  deleteLessonController,
  reorderLessonsController,
  updateLessonController
} from '../controllers/admin-lessons.controller'
import {
  createLessonSchema,
  deleteLessonSchema,
  reorderLessonsSchema,
  updateLessonSchema
} from '../validators/admin-lessons.validator'

export const adminLessonRoutes = Router()

adminLessonRoutes.post(
  '/chapters/:chapterId/lessons',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(createLessonSchema),
  asyncHandler(createLessonController)
)

adminLessonRoutes.patch(
  '/lessons/:lessonId',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(updateLessonSchema),
  asyncHandler(updateLessonController)
)

adminLessonRoutes.delete(
  '/lessons/:lessonId',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(deleteLessonSchema),
  asyncHandler(deleteLessonController)
)

adminLessonRoutes.patch(
  '/chapters/:chapterId/lessons/reorder',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(reorderLessonsSchema),
  asyncHandler(reorderLessonsController)
)
