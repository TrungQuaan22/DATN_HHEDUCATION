import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireActiveSession } from '~/common/middlewares/require-active-session'
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
  createLessonMaterialController,
  deleteLessonMaterialController,
  ingestLessonMaterialController,
  listLessonMaterialsController,
  updateLessonMaterialController
} from '../controllers/admin-lesson-materials.controller'
import {
  createLessonSchema,
  deleteLessonSchema,
  reorderLessonsSchema,
  updateLessonSchema
} from '../validators/admin-lessons.validator'
import {
  createLessonMaterialSchema,
  deleteLessonMaterialSchema,
  ingestLessonMaterialSchema,
  listLessonMaterialsSchema,
  updateLessonMaterialSchema
} from '../validators/admin-lesson-materials.validator'

export const adminLessonRoutes = Router()

adminLessonRoutes.post(
  '/chapters/:chapterId/lessons',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(createLessonSchema),
  asyncHandler(createLessonController)
)

adminLessonRoutes.patch(
  '/lessons/:lessonId',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(updateLessonSchema),
  asyncHandler(updateLessonController)
)

adminLessonRoutes.delete(
  '/lessons/:lessonId',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(deleteLessonSchema),
  asyncHandler(deleteLessonController)
)

adminLessonRoutes.post(
  '/lessons/:lessonId/materials',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(createLessonMaterialSchema),
  asyncHandler(createLessonMaterialController)
)

adminLessonRoutes.get(
  '/lessons/:lessonId/materials',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(listLessonMaterialsSchema),
  asyncHandler(listLessonMaterialsController)
)

adminLessonRoutes.patch(
  '/lesson-materials/:materialId',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(updateLessonMaterialSchema),
  asyncHandler(updateLessonMaterialController)
)

adminLessonRoutes.delete(
  '/lesson-materials/:materialId',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(deleteLessonMaterialSchema),
  asyncHandler(deleteLessonMaterialController)
)

adminLessonRoutes.post(
  '/lesson-materials/:materialId/ingest',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(ingestLessonMaterialSchema),
  asyncHandler(ingestLessonMaterialController)
)

adminLessonRoutes.patch(
  '/chapters/:chapterId/lessons/reorder',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(reorderLessonsSchema),
  asyncHandler(reorderLessonsController)
)
