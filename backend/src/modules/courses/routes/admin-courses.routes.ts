import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireActiveSession } from '~/common/middlewares/require-active-session'
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
  getCourseStudentProgressController,
  listCourseStudentsController
} from '../controllers/admin-course-students.controller'
import {
  changeCourseStatusSchema,
  createCourseSchema,
  getAdminCourseSchema,
  listAdminCoursesSchema,
  updateCourseSchema
} from '../validators/admin-courses.validator'
import {
  getAdminCourseStudentProgressSchema,
  listAdminCourseStudentsSchema
} from '../validators/admin-course-students.validator'

export const adminCourseRoutes = Router()

adminCourseRoutes.post(
  '/courses',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(createCourseSchema),
  asyncHandler(createCourseController)
)

adminCourseRoutes.get(
  '/courses',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(listAdminCoursesSchema),
  asyncHandler(listAdminCoursesController)
)

adminCourseRoutes.get(
  '/courses/:courseId',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(getAdminCourseSchema),
  asyncHandler(getAdminCourseController)
)

adminCourseRoutes.get(
  '/courses/:courseId/students',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(listAdminCourseStudentsSchema),
  asyncHandler(listCourseStudentsController)
)

adminCourseRoutes.get(
  '/courses/:courseId/students/:studentId/progress',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(getAdminCourseStudentProgressSchema),
  asyncHandler(getCourseStudentProgressController)
)

adminCourseRoutes.patch(
  '/courses/:courseId',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(updateCourseSchema),
  asyncHandler(updateCourseController)
)

adminCourseRoutes.patch(
  '/courses/:courseId/publish',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin),
  validateRequest(changeCourseStatusSchema),
  asyncHandler(publishCourseController)
)

adminCourseRoutes.patch(
  '/courses/:courseId/archive',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin),
  validateRequest(changeCourseStatusSchema),
  asyncHandler(archiveCourseController)
)
