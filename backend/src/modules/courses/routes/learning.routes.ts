import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireAuth } from '~/common/middlewares/require-auth'
import { requireRole } from '~/common/middlewares/require-role'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  getLearningCourseController,
  getLearningLessonController,
  listMyLearningCoursesController,
  streamLearningLessonHlsController,
  updateLessonProgressController
} from '../controllers/learning.controller'
import {
  getLearningCourseSchema,
  getLearningLessonHlsSchema,
  getLearningLessonSchema,
  updateLessonProgressSchema,
  listMyCoursesSchema
} from '../validators/learning.validator'

export const learningCourseRoutes = Router()

learningCourseRoutes.get(
  '/courses',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(listMyCoursesSchema),
  asyncHandler(listMyLearningCoursesController)
)

learningCourseRoutes.get(
  '/courses/:courseSlug',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(getLearningCourseSchema),
  asyncHandler(getLearningCourseController)
)

learningCourseRoutes.get(
  '/lessons/:lessonId/hls/:fileName',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(getLearningLessonHlsSchema),
  asyncHandler(streamLearningLessonHlsController)
)

learningCourseRoutes.get(
  '/lessons/:lessonId',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(getLearningLessonSchema),
  asyncHandler(getLearningLessonController)
)

learningCourseRoutes.post(
  '/lessons/:lessonId/progress',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(updateLessonProgressSchema),
  asyncHandler(updateLessonProgressController)
)
