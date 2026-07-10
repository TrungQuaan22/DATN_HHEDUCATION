import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireAuth } from '~/common/middlewares/require-auth'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  getRuntimeAssessmentBySlugController,
  getRuntimeAssessmentController,
  listPublicPlacementsController
} from '../controllers/public.controller'
import {
  listPublicPlacementsSchema,
  placementIdSchema,
  placementSlugSchema
} from '../validators/assessment.validator'

export const publicAssessmentRoutes = Router()

// API public practice: liệt kê các bài luyện tập công khai.
publicAssessmentRoutes.get(
  '/assessments',
  validateRequest(listPublicPlacementsSchema),
  asyncHandler(listPublicPlacementsController)
)

// API lấy preview bài luyện tập công khai theo slug.
publicAssessmentRoutes.get(
  '/assessment-placements/slug/:slug',
  requireAuth,
  validateRequest(placementSlugSchema),
  asyncHandler(getRuntimeAssessmentBySlugController)
)

// API lấy preview placement theo id cho người dùng đã đăng nhập.
publicAssessmentRoutes.get(
  '/assessment-placements/:placementId',
  requireAuth,
  validateRequest(placementIdSchema),
  asyncHandler(getRuntimeAssessmentController)
)

