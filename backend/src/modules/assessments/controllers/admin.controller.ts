import type { Request, Response } from 'express'
import type z from 'zod'

import { sendSuccess } from '~/common/http/response'

import {
  adminAssessmentService,
  type AdminAssessmentService
} from '../services/admin.service'
import type {
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

type CreateAssessmentValidated = z.infer<typeof createAssessmentSchema>
type UpdateAssessmentValidated = z.infer<typeof updateAssessmentSchema>
type CreateAssessmentSectionValidated = z.infer<typeof createAssessmentSectionSchema>
type UpdateAssessmentSectionValidated = z.infer<typeof updateAssessmentSectionSchema>
type DeleteAssessmentSectionValidated = z.infer<typeof deleteAssessmentSectionSchema>
type CreateAssessmentItemsValidated = z.infer<typeof createAssessmentItemsSchema>
type UpdateAssessmentItemValidated = z.infer<typeof updateAssessmentItemSchema>
type DeleteAssessmentItemValidated = z.infer<typeof deleteAssessmentItemSchema>
type CreatePlacementValidated = z.infer<typeof createPlacementSchema>
type UpsertPlacementValidated = z.infer<typeof upsertPlacementSchema>
type UpdateAssessmentVisibilityValidated = z.infer<typeof updateAssessmentVisibilitySchema>
type CloneAssessmentValidated = z.infer<typeof cloneAssessmentSchema>
type AssessmentIdValidated = z.infer<typeof assessmentIdSchema>
type ListAdminAssessmentsValidated = z.infer<typeof listAdminAssessmentsSchema>
type ListGradingSubmissionsValidated = z.infer<typeof listGradingSubmissionsSchema>
type SubmissionIdValidated = z.infer<typeof submissionIdSchema>
type GradeEssayValidated = z.infer<typeof gradeEssaySchema>
type FinalizeManualSubmissionValidated = z.infer<typeof finalizeManualSubmissionSchema>

export class AdminAssessmentController {
  constructor(private readonly service: AdminAssessmentService) {}

  listAdminAssessments = async (req: Request, res: Response) => {
    const validated = req.validated as ListAdminAssessmentsValidated
    const data = await this.service.listAdminAssessments({
      ...validated.query,
      actor: req.user!
    })

    sendSuccess({ res, data })
  }

  getAdminAssessment = async (req: Request, res: Response) => {
    const validated = req.validated as AssessmentIdValidated
    const data = await this.service.getAdminAssessment({
      actor: req.user!,
      assessmentId: validated.params.assessmentId
    })

    sendSuccess({ res, data })
  }

  createAssessment = async (req: Request, res: Response) => {
    const validated = req.validated as CreateAssessmentValidated
    const data = await this.service.createAssessment(req.user!, validated.body)

    sendSuccess({ res, data, status: 201 })
  }

  updateAssessment = async (req: Request, res: Response) => {
    const validated = req.validated as UpdateAssessmentValidated
    const data = await this.service.updateAssessment(req.user!, validated.params.assessmentId, validated.body)

    sendSuccess({ res, data })
  }

  createSection = async (req: Request, res: Response) => {
    const validated = req.validated as CreateAssessmentSectionValidated
    const data = await this.service.createSection(req.user!, validated.params.assessmentId, validated.body)

    sendSuccess({ res, data, status: 201 })
  }

  updateSection = async (req: Request, res: Response) => {
    const validated = req.validated as UpdateAssessmentSectionValidated
    const data = await this.service.updateSection(
      req.user!,
      validated.params.assessmentId,
      validated.params.sectionId,
      validated.body
    )

    sendSuccess({ res, data })
  }

  deleteSection = async (req: Request, res: Response) => {
    const validated = req.validated as DeleteAssessmentSectionValidated
    const data = await this.service.deleteSection(
      req.user!,
      validated.params.assessmentId,
      validated.params.sectionId
    )

    sendSuccess({ res, data })
  }

  createSectionItems = async (req: Request, res: Response) => {
    const validated = req.validated as CreateAssessmentItemsValidated
    const data = await this.service.createSectionItems(
      req.user!,
      validated.params.assessmentId,
      validated.params.sectionId,
      validated.body
    )

    sendSuccess({ res, data, status: 201 })
  }

  updateSectionItem = async (req: Request, res: Response) => {
    const validated = req.validated as UpdateAssessmentItemValidated & {
      params: { assessmentId: string; itemId: string }
      body: Record<string, unknown>
    }
    const data = await this.service.updateSectionItem(
      req.user!,
      validated.params.assessmentId,
      validated.params.itemId,
      validated.body as never
    )

    sendSuccess({ res, data })
  }

  deleteSectionItem = async (req: Request, res: Response) => {
    const validated = req.validated as DeleteAssessmentItemValidated
    const data = await this.service.deleteSectionItem(
      req.user!,
      validated.params.assessmentId,
      validated.params.itemId
    )

    sendSuccess({ res, data })
  }

  createPlacement = async (req: Request, res: Response) => {
    const validated = req.validated as CreatePlacementValidated
    const data = await this.service.createPlacement(req.user!, validated.body)

    sendSuccess({ res, data, status: 201 })
  }

  publishAssessment = async (req: Request, res: Response) => {
    const validated = req.validated as AssessmentIdValidated
    const data = await this.service.publishAssessment(req.user!, validated.params.assessmentId)

    sendSuccess({ res, data })
  }

  updateVisibility = async (req: Request, res: Response) => {
    const validated = req.validated as UpdateAssessmentVisibilityValidated
    const data = await this.service.updateVisibility(
      req.user!,
      validated.params.assessmentId,
      validated.body.visibility
    )

    sendSuccess({ res, data })
  }

  upsertPlacement = async (req: Request, res: Response) => {
    const validated = req.validated as UpsertPlacementValidated
    const data = await this.service.upsertPlacement(req.user!, validated.params.assessmentId, validated.body)

    sendSuccess({ res, data })
  }

  deletePlacement = async (req: Request, res: Response) => {
    const validated = req.validated as AssessmentIdValidated
    const data = await this.service.deletePlacement(req.user!, validated.params.assessmentId)

    sendSuccess({ res, data })
  }

  cloneAssessment = async (req: Request, res: Response) => {
    const validated = req.validated as CloneAssessmentValidated
    const data = await this.service.cloneAssessment(req.user!, validated.params.assessmentId, validated.body ?? {})

    sendSuccess({ res, data, status: 201 })
  }

  listGradingSubmissions = async (req: Request, res: Response) => {
    const validated = req.validated as ListGradingSubmissionsValidated
    const data = await this.service.listGradingSubmissions({
      ...validated.query,
      actor: req.user!
    })

    sendSuccess({ res, data })
  }

  getGradingSubmission = async (req: Request, res: Response) => {
    const validated = req.validated as SubmissionIdValidated
    const data = await this.service.getGradingSubmission(req.user!, validated.params.submissionId)

    sendSuccess({ res, data })
  }

  gradeEssay = async (req: Request, res: Response) => {
    const validated = req.validated as GradeEssayValidated
    const data = await this.service.gradeEssay({
      submissionId: validated.params.submissionId,
      itemId: validated.body.itemId,
      teacherScore: validated.body.teacherScore,
      teacherNote: validated.body.teacherNote,
      actor: req.user!,
      gradedBy: req.user!.id
    })

    sendSuccess({ res, data })
  }

  finalizeManualSubmission = async (req: Request, res: Response) => {
    const validated = req.validated as FinalizeManualSubmissionValidated
    const data = await this.service.finalizeManualSubmission({
      actor: req.user!,
      submissionId: validated.params.submissionId
    })

    sendSuccess({ res, data })
  }
}

export const adminAssessmentController = new AdminAssessmentController(adminAssessmentService)

export const listAdminAssessmentsController = adminAssessmentController.listAdminAssessments
export const getAdminAssessmentController = adminAssessmentController.getAdminAssessment
export const createAssessmentController = adminAssessmentController.createAssessment
export const updateAssessmentController = adminAssessmentController.updateAssessment
export const createSectionController = adminAssessmentController.createSection
export const updateSectionController = adminAssessmentController.updateSection
export const deleteSectionController = adminAssessmentController.deleteSection
export const createSectionItemsController = adminAssessmentController.createSectionItems
export const importSectionItemsController = adminAssessmentController.createSectionItems
export const updateSectionItemController = adminAssessmentController.updateSectionItem
export const deleteSectionItemController = adminAssessmentController.deleteSectionItem

export const createPlacementController = adminAssessmentController.createPlacement
export const upsertPlacementController = adminAssessmentController.upsertPlacement
export const deletePlacementController = adminAssessmentController.deletePlacement
export const cloneAssessmentController = adminAssessmentController.cloneAssessment
export const publishAssessmentController = adminAssessmentController.publishAssessment
export const updateVisibilityController = adminAssessmentController.updateVisibility
export const listGradingSubmissionsController = adminAssessmentController.listGradingSubmissions
export const getGradingSubmissionController = adminAssessmentController.getGradingSubmission
export const gradeEssayController = adminAssessmentController.gradeEssay
export const finalizeManualSubmissionController = adminAssessmentController.finalizeManualSubmission
