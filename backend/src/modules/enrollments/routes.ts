import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireActiveSession } from '~/common/middlewares/require-active-session'
import { requireAuth } from '~/common/middlewares/require-auth'
import { requireRole } from '~/common/middlewares/require-role'
import { validateRequest } from '~/common/middlewares/validate-request'

import { createManualEnrollmentController } from './controller'
import { createManualEnrollmentSchema } from './validators'

export const enrollmentRoutes = Router()

//Manual enrollment by admin
enrollmentRoutes.post(
  '/enrollments',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin),
  validateRequest(createManualEnrollmentSchema),
  asyncHandler(createManualEnrollmentController)
)
