import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireAuth } from '~/common/middlewares/require-auth'
import { requireRole } from '~/common/middlewares/require-role'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  archiveCourseController,
  createCourseController,
  getAdminCourseController,
  listAdminCoursesController,
  publishCourseController,
  updateCourseController
} from '../controllers/admin-courses.controller'
import {
  changeCourseStatusSchema,
  createCourseSchema,
  getAdminCourseSchema,
  listAdminCoursesSchema,
  updateCourseSchema
} from '../validators/admin-courses.validator'

export const adminCourseRoutes = Router()

adminCourseRoutes.post(
  '/courses',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(createCourseSchema),
  asyncHandler(createCourseController)
)

adminCourseRoutes.get(
  '/courses',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(listAdminCoursesSchema),
  asyncHandler(listAdminCoursesController)
)

adminCourseRoutes.get(
  '/courses/:courseId',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(getAdminCourseSchema),
  asyncHandler(getAdminCourseController)
)

adminCourseRoutes.patch(
  '/courses/:courseId',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(updateCourseSchema),
  asyncHandler(updateCourseController)
)

adminCourseRoutes.patch(
  '/courses/:courseId/publish',
  requireAuth,
  requireRole(UserRole.admin),
  validateRequest(changeCourseStatusSchema),
  asyncHandler(publishCourseController)
)

adminCourseRoutes.patch(
  '/courses/:courseId/archive',
  requireAuth,
  requireRole(UserRole.admin),
  validateRequest(changeCourseStatusSchema),
  asyncHandler(archiveCourseController)
)

