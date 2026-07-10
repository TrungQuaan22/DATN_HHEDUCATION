import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'
import type { SubjectValue } from '~/common/constant/taxonomy'

import { AssessmentPlacementType } from '@prisma/client'

import { mapPlacementSummary, mapRuntimePlacementPreview } from '../mappers/assessment.mapper'
import type { PublicAssessmentRepositoryPort } from '../ports/public-assessment-repository.port'
import type { StudentAssessmentRepositoryPort } from '../ports/student-assessment-repository.port'
import { validatePlacementAccess } from '../policies/assessment-placement.policy'
import type { SubmissionSummary } from '../types'

// Map thông tin lần làm ngắn gọn cho preview assessment.
const mapSubmissionSummaryForRuntime = (submission: SubmissionSummary) => ({
  id: submission.id,
  assessmentId: submission.assessmentId,
  placementId: submission.placementId,
  attemptNumber: submission.attemptNumber,
  status: submission.status,
  startTime: submission.startTime,
  submitTime: submission.submitTime,
  autoScore: submission.autoScore?.toString() ?? null,
  finalScore: submission.finalScore?.toString() ?? null
})

export class PublicAssessmentService {
  constructor(
    private readonly repository: PublicAssessmentRepositoryPort,
    private readonly studentRepository: StudentAssessmentRepositoryPort
  ) {}

  // Liệt kê các assessment public practice.
  async listPublicPlacements(data: {
    subject?: SubjectValue
    grade?: number
    page: number
    limit: number
  }) {
    const [placements, totalItems] = await this.repository.listPublicPlacements({
      subject: data.subject,
      grade: data.grade,
      page: data.page,
      limit: data.limit
    })

    return {
      items: placements.map(mapPlacementSummary),
      pagination: {
        page: data.page,
        limit: data.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / data.limit)
      }
    }
  }

  // Lấy preview runtime của assessment theo placementId.
  async getRuntimeAssessment(data: { userId?: string; placementId: string }) {
    const placement = data.userId
      ? await this.repository.findRuntimePreviewPlacementByIdForStudent(
          data.placementId,
          data.userId
        )
      : await this.repository.findRuntimePreviewPlacementById(data.placementId)

    if (!placement) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment placement not found')
    }

    const enrollment = data.userId
      ? placement.type === AssessmentPlacementType.course
        ? await this.studentRepository.findEnrollmentForPlacement(data.userId, placement.id)
        : await this.studentRepository.findEnrollmentForLessonPlacement(data.userId, placement.id)
      : null
    validatePlacementAccess(data.userId, placement, enrollment)
    const submissions =
      'submissions' in placement && Array.isArray(placement.submissions)
        ? placement.submissions.map(mapSubmissionSummaryForRuntime)
        : []

    return {
      ...mapRuntimePlacementPreview(placement),
      submissions
    }
  }

  // Lấy preview runtime của assessment public theo slug.
  async getRuntimeAssessmentBySlug(data: { userId?: string; slug: string }) {
    const placement = await this.repository.findRuntimePreviewPlacementBySlug(data.slug)

    if (!placement) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment placement not found')
    }

    const enrollment = data.userId
      ? placement.type === AssessmentPlacementType.course
        ? await this.studentRepository.findEnrollmentForPlacement(data.userId, placement.id)
        : await this.studentRepository.findEnrollmentForLessonPlacement(data.userId, placement.id)
      : null
    validatePlacementAccess(data.userId, placement, enrollment)
    return mapRuntimePlacementPreview(placement)
  }
}
