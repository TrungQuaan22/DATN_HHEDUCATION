import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireAuth } from '~/common/middlewares/require-auth'
import { requireRole } from '~/common/middlewares/require-role'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  cloneAssessmentController,
  createAssessmentController,
  createSectionController,
  createSectionItemsController,
  updateAssessmentController,
  updateSectionController,
  updateSectionItemController,
  deleteSectionController,
  deleteSectionItemController,
  importSectionItemsController,
  createPlacementController,
  deletePlacementController,
  finalizeManualSubmissionController,
  gradeEssayController,
  getGradingSubmissionController,
  listAdminAssessmentsController,
  getAdminAssessmentController,
  listGradingSubmissionsController,
  publishAssessmentController,
  updateVisibilityController,
  upsertPlacementController
} from '../controllers/admin.controller'
import {
  assessmentIdSchema,
  cloneAssessmentSchema,
  createAssessmentSchema,
  createAssessmentItemsSchema,
  createAssessmentSectionSchema,
  updateAssessmentSchema,
  updateAssessmentItemSchema,
  updateAssessmentSectionSchema,
  deleteAssessmentItemSchema,
  deleteAssessmentSectionSchema,
  createPlacementSchema,
  finalizeManualSubmissionSchema,
  gradeEssaySchema,
  listAdminAssessmentsSchema,
  listGradingSubmissionsSchema,
  submissionIdSchema,
  updateAssessmentVisibilitySchema,
  upsertPlacementSchema
} from '../validators/assessment.validator'

export const adminAssessmentRoutes = Router()

adminAssessmentRoutes.get(
  '/assessments',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(listAdminAssessmentsSchema),
  asyncHandler(listAdminAssessmentsController)
)

adminAssessmentRoutes.get(
  '/assessments/:assessmentId',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(assessmentIdSchema),
  asyncHandler(getAdminAssessmentController)
)

adminAssessmentRoutes.post(
  '/assessments',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(createAssessmentSchema),
  asyncHandler(createAssessmentController)
)

adminAssessmentRoutes.patch(
  '/assessments/:assessmentId',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(updateAssessmentSchema),
  asyncHandler(updateAssessmentController)
)

adminAssessmentRoutes.post(
  '/assessments/:assessmentId/sections',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(createAssessmentSectionSchema),
  asyncHandler(createSectionController)
)

adminAssessmentRoutes.patch(
  '/assessments/:assessmentId/sections/:sectionId',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(updateAssessmentSectionSchema),
  asyncHandler(updateSectionController)
)

adminAssessmentRoutes.delete(
  '/assessments/:assessmentId/sections/:sectionId',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(deleteAssessmentSectionSchema),
  asyncHandler(deleteSectionController)
)

adminAssessmentRoutes.post(
  '/assessments/:assessmentId/sections/:sectionId/items',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(createAssessmentItemsSchema),
  asyncHandler(createSectionItemsController)
)

adminAssessmentRoutes.post(
  '/assessments/:assessmentId/sections/:sectionId/items/import',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(createAssessmentItemsSchema),
  asyncHandler(importSectionItemsController)
)

adminAssessmentRoutes.patch(
  '/assessments/:assessmentId/items/:itemId',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(updateAssessmentItemSchema),
  asyncHandler(updateSectionItemController)
)

adminAssessmentRoutes.delete(
  '/assessments/:assessmentId/items/:itemId',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(deleteAssessmentItemSchema),
  asyncHandler(deleteSectionItemController)
)

adminAssessmentRoutes.post(
  '/assessments/:assessmentId/publish',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(assessmentIdSchema),
  asyncHandler(publishAssessmentController)
)

adminAssessmentRoutes.patch(
  '/assessments/:assessmentId/visibility',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(updateAssessmentVisibilitySchema),
  asyncHandler(updateVisibilityController)
)

adminAssessmentRoutes.post(
  '/assessments/:assessmentId/clone',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(cloneAssessmentSchema),
  asyncHandler(cloneAssessmentController)
)

adminAssessmentRoutes.put(
  '/assessments/:assessmentId/placement',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(upsertPlacementSchema),
  asyncHandler(upsertPlacementController)
)

adminAssessmentRoutes.delete(
  '/assessments/:assessmentId/placement',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(assessmentIdSchema),
  asyncHandler(deletePlacementController)
)

adminAssessmentRoutes.post(
  '/assessment-placements',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(createPlacementSchema),
  asyncHandler(createPlacementController)
)

adminAssessmentRoutes.get(
  '/assessment-submissions/grading',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(listGradingSubmissionsSchema),
  asyncHandler(listGradingSubmissionsController)
)

adminAssessmentRoutes.get(
  '/assessment-submissions/:submissionId',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(submissionIdSchema),
  asyncHandler(getGradingSubmissionController)
)

adminAssessmentRoutes.patch(
  '/assessment-submissions/:submissionId/essay-score',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(gradeEssaySchema),
  asyncHandler(gradeEssayController)
)

adminAssessmentRoutes.post(
  '/assessment-submissions/:submissionId/finalize',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(finalizeManualSubmissionSchema),
  asyncHandler(finalizeManualSubmissionController)
)
