import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

import type { AssessmentActorDto } from '../dto'
import type { AssessmentParticipantStatus } from '../helpers/assessment-results.helper'
import { mapAssessmentResultParticipant } from '../mappers/assessment-results.mapper'
import type { AdminAssessmentResultRepositoryPort } from '../ports/admin-assessment-result-repository.port'
import { validateCanViewAssessment } from '../policies/assessment-access.policy'

export class AdminAssessmentResultService {
  constructor(private readonly repository: AdminAssessmentResultRepositoryPort) {}

  private async getAccessibleContext(assessmentId: string, actor: AssessmentActorDto) {
    const context = await this.repository.findResultContext(assessmentId)
    if (!context) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment not found')
    }

    validateCanViewAssessment(context, actor, context.placement ? [context.placement] : [])
    return context
  }

  async listResults(data: {
    actor: AssessmentActorDto
    assessmentId: string
    page: number
    limit: number
    search?: string
    status?: AssessmentParticipantStatus
  }) {
    const context = await this.getAccessibleContext(data.assessmentId, data.actor)
    const course = context.placement?.course ?? context.placement?.lesson?.chapter.course ?? null
    const records = await this.repository.listParticipants({
      assessmentId: data.assessmentId,
      courseId: course?.id ?? null,
      search: data.search
    })
    const allItems = records.map(mapAssessmentResultParticipant)
    const scoreValues = allItems
      .map((item) => item.bestScore)
      .filter((score): score is string => score !== null)
      .map(Number)
    const filteredItems = data.status
      ? allItems.filter((item) => item.status === data.status)
      : allItems
    const start = (data.page - 1) * data.limit

    return {
      assessment: {
        id: context.id,
        title: context.title,
        subject: context.subject,
        grade: context.grade,
        type: context.type,
        gradingType: context.gradingType,
        timeLimitMinutes: context.timeLimitMinutes,
        maxScore: context.maxScore,
        placement: context.placement
          ? {
              id: context.placement.id,
              type: context.placement.type,
              openTime: context.placement.openTime,
              closeTime: context.placement.closeTime,
              maxAttempts: context.placement.maxAttempts,
              course: course ? { id: course.id, title: course.title } : null
            }
          : null
      },
      stats: {
        totalStudents: allItems.length,
        notStarted: allItems.filter((item) => item.status === 'not_started').length,
        doing: allItems.filter((item) => item.status === 'doing').length,
        pendingGrading: allItems.filter((item) => item.status === 'pending_grading').length,
        completed: allItems.filter((item) => item.status === 'completed').length,
        highestScore: scoreValues.length ? Math.max(...scoreValues).toString() : null,
        lowestScore: scoreValues.length ? Math.min(...scoreValues).toString() : null,
        averageScore: scoreValues.length
          ? (scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length).toFixed(2)
          : null
      },
      items: filteredItems.slice(start, start + data.limit),
      pagination: {
        page: data.page,
        limit: data.limit,
        totalItems: filteredItems.length,
        totalPages: Math.ceil(filteredItems.length / data.limit)
      }
    }
  }

  async getStudentAttempts(data: {
    actor: AssessmentActorDto
    assessmentId: string
    studentId: string
  }) {
    const context = await this.getAccessibleContext(data.assessmentId, data.actor)
    const course = context.placement?.course ?? context.placement?.lesson?.chapter.course ?? null
    const participant = await this.repository.findParticipant({
      assessmentId: data.assessmentId,
      courseId: course?.id ?? null,
      studentId: data.studentId
    })
    if (!participant) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Student is not in this assessment')
    }

    return {
      assessment: {
        id: context.id,
        title: context.title,
        maxScore: context.maxScore,
        gradingType: context.gradingType
      },
      participant: mapAssessmentResultParticipant(participant),
      attempts: participant.attempts.map((attempt) => ({ ...attempt }))
    }
  }
}
