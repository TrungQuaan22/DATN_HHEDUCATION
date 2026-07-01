import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireAuth } from '~/common/middlewares/require-auth'
import { requireRole } from '~/common/middlewares/require-role'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  getAssessmentWorkspaceController,
  getSubmissionResultController,
  listStudentAssessmentsController,
  recordViolationController,
  saveAnswersController,
  startAttemptController,
  submitAttemptController
} from '../controllers/student.controller'
import { getRuntimeAssessmentController } from '../controllers/public.controller'
import {
  listStudentAssessmentsSchema,
  placementIdSchema,
  placementWorkspaceSchema,
  saveAnswersSchema,
  startAttemptSchema,
  submissionIdSchema,
  submitAttemptSchema
} from '../validators/assessment.validator'

export const learningAssessmentRoutes = Router()

learningAssessmentRoutes.get(
  '/assessments',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(listStudentAssessmentsSchema),
  asyncHandler(listStudentAssessmentsController)
)

learningAssessmentRoutes.get(
  '/assessment-placements/:placementId/workspace',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(placementWorkspaceSchema),
  asyncHandler(getAssessmentWorkspaceController)
)

learningAssessmentRoutes.get(
  '/assessment-submissions/:submissionId/result',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(submissionIdSchema),
  asyncHandler(getSubmissionResultController)
)

learningAssessmentRoutes.get(
  '/assessment-placements/:placementId',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(placementIdSchema),
  asyncHandler(getRuntimeAssessmentController)
)

learningAssessmentRoutes.post(
  '/assessment-placements/:placementId/attempts',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(startAttemptSchema),
  asyncHandler(startAttemptController)
)

learningAssessmentRoutes.put(
  '/assessment-submissions/:submissionId/answers',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(saveAnswersSchema),
  asyncHandler(saveAnswersController)
)

learningAssessmentRoutes.post(
  '/assessment-submissions/:submissionId/submit',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(submitAttemptSchema),
  asyncHandler(submitAttemptController)
)

learningAssessmentRoutes.post(
  '/assessment-submissions/:submissionId/violations',
  requireAuth,
  requireRole(UserRole.student),
  validateRequest(submissionIdSchema),
  asyncHandler(recordViolationController)
)
