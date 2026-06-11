import { Subject } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

import {
  mapPlacementSummary,
  mapRuntimePlacementPreview
} from '../mappers/assessment.mapper'
import type { PublicAssessmentRepositoryPort } from '../ports/public-assessment-repository.port'
import { publicAssessmentRepository } from '../repositories'
import {
  ensurePlacementAccess
} from '../ensures/assessment.ensure'

const mapSubmissionSummaryForRuntime = (submission: any) => ({
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
  constructor(private readonly repository: PublicAssessmentRepositoryPort) {}

  async listPublicPlacements(data: {
    subject?: Subject
    grade?: number
    page: number
    limit: number
  }) {
    const [placements, totalItems] = await this.repository.listPublicPlacements({
      subject: data.subject,
      grade: data.grade,
      skip: (data.page - 1) * data.limit,
      take: data.limit
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

  async getRuntimeAssessment(data: { userId?: string; placementId: string }) {
    const placement = data.userId
      ? await this.repository.findRuntimePreviewPlacementByIdForStudent(data.placementId, data.userId)
      : await this.repository.findRuntimePreviewPlacementById(data.placementId)

    if (!placement) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment placement not found')
    }

    await ensurePlacementAccess(data.userId, placement)
    const submissions =
      'submissions' in placement && Array.isArray(placement.submissions)
        ? placement.submissions.map(mapSubmissionSummaryForRuntime)
        : []

    return {
      ...mapRuntimePlacementPreview(placement),
      submissions
    }
  }

  async getRuntimeAssessmentBySlug(data: { userId?: string; slug: string }) {
    const placement = await this.repository.findRuntimePreviewPlacementBySlug(data.slug)

    if (!placement) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment placement not found')
    }

    await ensurePlacementAccess(data.userId, placement)
    return mapRuntimePlacementPreview(placement)
  }
}

export const publicAssessmentService = new PublicAssessmentService(publicAssessmentRepository)
