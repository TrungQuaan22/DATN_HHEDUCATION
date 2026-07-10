import type { Request, Response } from 'express'
import type z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type { AdminAssessmentService } from '../services/admin.service'
import { adminAssessmentService } from '../wiring'
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

  // Lấy danh sách assessment cho admin/teacher theo bộ lọc.
  listAdminAssessments = async (req: Request, res: Response) => {
    const validated = req.validated as ListAdminAssessmentsValidated
    const data = await this.service.listAdminAssessments({
      ...validated.query,
      actor: req.user!
    })

    sendSuccess({ res, data })
  }

  // Lấy chi tiết assessment để quản trị nội dung, placement và câu hỏi.
  getAdminAssessment = async (req: Request, res: Response) => {
    const validated = req.validated as AssessmentIdValidated
    const data = await this.service.getAdminAssessment({
      actor: req.user!,
      assessmentId: validated.params.assessmentId
    })

    sendSuccess({ res, data })
  }

  // Tạo assessment mới ở trạng thái draft.
  createAssessment = async (req: Request, res: Response) => {
    const validated = req.validated as CreateAssessmentValidated
    const data = await this.service.createAssessment(req.user!, validated.body)

    sendSuccess({ res, data, status: 201 })
  }

  // Cập nhật thông tin chung của assessment.
  updateAssessment = async (req: Request, res: Response) => {
    const validated = req.validated as UpdateAssessmentValidated
    const data = await this.service.updateAssessment(req.user!, validated.params.assessmentId, validated.body)

    sendSuccess({ res, data })
  }

  // Tạo section/phần câu hỏi trong assessment.
  createSection = async (req: Request, res: Response) => {
    const validated = req.validated as CreateAssessmentSectionValidated
    const data = await this.service.createSection(req.user!, validated.params.assessmentId, validated.body)

    sendSuccess({ res, data, status: 201 })
  }

  // Cập nhật tên hoặc mô tả section.
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

  // Xóa section khi chưa có item và chưa bị khóa bởi submission.
  deleteSection = async (req: Request, res: Response) => {
    const validated = req.validated as DeleteAssessmentSectionValidated
    const data = await this.service.deleteSection(
      req.user!,
      validated.params.assessmentId,
      validated.params.sectionId
    )

    sendSuccess({ res, data })
  }

  // Thêm hoặc import các item/câu hỏi vào section.
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

  // Cập nhật một item/câu hỏi trong assessment.
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

  // Xóa một item/câu hỏi khỏi assessment.
  deleteSectionItem = async (req: Request, res: Response) => {
    const validated = req.validated as DeleteAssessmentItemValidated
    const data = await this.service.deleteSectionItem(
      req.user!,
      validated.params.assessmentId,
      validated.params.itemId
    )

    sendSuccess({ res, data })
  }

  // Tạo placement để gắn assessment vào public/course/lesson.
  createPlacement = async (req: Request, res: Response) => {
    const validated = req.validated as CreatePlacementValidated
    const data = await this.service.createPlacement(req.user!, validated.body)

    sendSuccess({ res, data, status: 201 })
  }

  // Publish assessment sau khi đã validate đủ nội dung.
  publishAssessment = async (req: Request, res: Response) => {
    const validated = req.validated as AssessmentIdValidated
    const data = await this.service.publishAssessment(req.user!, validated.params.assessmentId)

    sendSuccess({ res, data })
  }

  // Đổi trạng thái hiển thị draft/published/hidden của assessment.
  updateVisibility = async (req: Request, res: Response) => {
    const validated = req.validated as UpdateAssessmentVisibilityValidated
    const data = await this.service.updateVisibility(
      req.user!,
      validated.params.assessmentId,
      validated.body.visibility
    )

    sendSuccess({ res, data })
  }

  // Tạo mới hoặc cập nhật placement chính của assessment.
  upsertPlacement = async (req: Request, res: Response) => {
    const validated = req.validated as UpsertPlacementValidated
    const data = await this.service.upsertPlacement(req.user!, validated.params.assessmentId, validated.body)

    sendSuccess({ res, data })
  }

  // Xóa placement hiện tại của assessment.
  deletePlacement = async (req: Request, res: Response) => {
    const validated = req.validated as AssessmentIdValidated
    const data = await this.service.deletePlacement(req.user!, validated.params.assessmentId)

    sendSuccess({ res, data })
  }

  // Nhân bản assessment để chỉnh sửa mà không ảnh hưởng bản cũ.
  cloneAssessment = async (req: Request, res: Response) => {
    const validated = req.validated as CloneAssessmentValidated
    const data = await this.service.cloneAssessment(req.user!, validated.params.assessmentId, validated.body ?? {})

    sendSuccess({ res, data, status: 201 })
  }

  // Liệt kê các submission cần chấm thủ công.
  listGradingSubmissions = async (req: Request, res: Response) => {
    const validated = req.validated as ListGradingSubmissionsValidated
    const data = await this.service.listGradingSubmissions({
      ...validated.query,
      actor: req.user!
    })

    sendSuccess({ res, data })
  }

  // Lấy chi tiết một submission để giáo viên chấm bài.
  getGradingSubmission = async (req: Request, res: Response) => {
    const validated = req.validated as SubmissionIdValidated
    const data = await this.service.getGradingSubmission(req.user!, validated.params.submissionId)

    sendSuccess({ res, data })
  }

  // Chấm điểm một câu essay trong submission.
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

  // Chốt điểm cuối cùng cho submission có phần chấm thủ công.
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
