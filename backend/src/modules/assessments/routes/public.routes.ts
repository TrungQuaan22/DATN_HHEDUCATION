import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
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

publicAssessmentRoutes.get(
  '/assessments',
  validateRequest(listPublicPlacementsSchema),
  asyncHandler(listPublicPlacementsController)
)

publicAssessmentRoutes.get(
  '/assessment-placements/slug/:slug',
  validateRequest(placementSlugSchema),
  asyncHandler(getRuntimeAssessmentBySlugController)
)

publicAssessmentRoutes.get(
  '/assessment-placements/:placementId',
  validateRequest(placementIdSchema),
  asyncHandler(getRuntimeAssessmentController)
)
