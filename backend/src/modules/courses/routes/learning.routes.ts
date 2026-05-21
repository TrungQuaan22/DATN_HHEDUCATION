import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireAuth } from '~/common/middlewares/require-auth'
import { requireRole } from '~/common/middlewares/require-role'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  getLearningCourseController,
  listMyLearningCoursesController
} from '../controllers/learning.controller'
import { getLearningCourseSchema } from '../validators/learning.validator'

export const learningCourseRoutes = Router()

learningCourseRoutes.get(
  '/courses',
  requireAuth,
  requireRole(UserRole.student),
  asyncHandler(listMyLearningCoursesController)
)

learningCourseRoutes.get(
  '/courses/:courseSlug',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(getLearningCourseSchema),
  asyncHandler(getLearningCourseController)
)
