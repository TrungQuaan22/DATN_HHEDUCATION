import {
  AssessmentItemType,
  AssessmentPlacementType,
  AssessmentType,
  AssessmentVisibility,
  GradingType,
  SubmissionStatus,
  UserRole
} from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

import type {
  AssessmentActorDto,
  CloneAssessmentDto,
  CreateAssessmentItemsDto,
  CreateAssessmentDto,
  CreateAssessmentSectionDto,
  CreatePlacementDto,
  GradeEssayDto,
  ListAdminAssessmentsDto
} from '../dto'
import { mapPlacementSummary } from '../mappers/assessment.mapper'
import { addScores, zeroScore } from '../helpers/score.helper'
import { Assessment } from '../entities/assessment.entity'
import type { AdminAssessmentRepositoryPort } from '../ports/admin-assessment-repository.port'
import {
  ensureAssessmentExists,
  ensureAssessmentForPublishExists,
  ensureSectionExists,
  ensureSectionBelongsToAssessment,
  ensureItemExists,
  ensureSubmissionForGradingExists,
  ensureTeacherOwnsCourse,
  ensureItemsCanUseCourseTopics,
  ensurePlacementTargetIsValid
} from '../ensures/assessment.ensure'

const ensureNonOwnerKeepsPlacementTarget = (
  actor: AssessmentActorDto,
  assessment: {
    createdById: string | null
    placements?: Array<{
      type: AssessmentPlacementType
      courseId: string | null
      lessonId: string | null
    }>
  },
  data: Omit<CreatePlacementDto, 'assessmentId'>
) => {
  const assessmentEntity = new Assessment(assessment as any)
  if (assessmentEntity.canManage(actor)) {
    return
  }

  const currentPlacement = assessment.placements?.[0]

  if (
    !currentPlacement ||
    currentPlacement.type !== data.type ||
    currentPlacement.courseId !== (data.courseId ?? null) ||
    currentPlacement.lessonId !== (data.lessonId ?? null)
  ) {
    throw new AppError(
      403,
      ERROR_CODE.FORBIDDEN,
      'Teachers can only update placement timing and attempt config for assessments in their courses'
    )
  }
}

const flattenSections = <TItem>(sections: Array<{ items: TItem[] }>): TItem[] =>
  sections.flatMap((section) => section.items)

export class AdminAssessmentService {
  constructor(private readonly repository: AdminAssessmentRepositoryPort) {}

  async listAdminAssessments(data: ListAdminAssessmentsDto & { actor: AssessmentActorDto }) {
    if (data.actor.role === UserRole.teacher && data.scope === 'course' && data.courseId) {
      const course = await this.repository.findCourseForPlacement(data.courseId)
      ensureTeacherOwnsCourse(data.actor, course)
    }

    const [items, totalItems] = await this.repository.listAdminAssessments({
      filters: {
        scope: data.scope,
        courseId: data.courseId,
        visibility: data.visibility,
        subject: data.subject,
        grade: data.grade,
        gradingType: data.gradingType,
        teacherId: data.actor.role === UserRole.teacher ? data.actor.id : undefined
      },
      skip: (data.page - 1) * data.limit,
      take: data.limit
    })

    return {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        subject: item.subject,
        grade: item.grade,
        type: item.type,
        gradingType: item.gradingType,
        visibility: item.visibility,
        timeLimitMinutes: item.timeLimitMinutes,
        createdById: item.createdById,
        itemCount: item._count.items,
        submissionCount: item._count.submissions,
        placements: item.placements.map((placement) => ({
          id: placement.id,
          type: placement.type,
          slug: placement.slug,
          courseId: placement.courseId,
          lessonId: placement.lessonId,
          isFeatured: placement.isFeatured
        })),
        createdAt: item.createdAt
      })),
      pagination: {
        page: data.page,
        limit: data.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / data.limit)
      }
    }
  }

  async getAdminAssessment(data: { actor: AssessmentActorDto; assessmentId: string }) {
    const assessmentRecord = await this.repository.findAssessmentForPublish(data.assessmentId)
    const assessment = ensureAssessmentForPublishExists(assessmentRecord)

    const assessmentEntity = new Assessment(assessment as any)
    if (!assessmentEntity.canView(data.actor, assessment.placements)) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You cannot view this assessment')
    }

    return {
      id: assessment.id,
      title: assessment.title,
      subject: assessment.subject,
      grade: assessment.grade,
      type: assessment.type,
      gradingType: assessment.gradingType,
      visibility: assessment.visibility,
      timeLimitMinutes: assessment.timeLimitMinutes,
      createdById: assessment.createdById,
      submissionCount: assessment._count.submissions,
      sourceMediaId: assessment.sourceMediaId,
      sourceMedia: assessment.sourceMedia,
      placements: assessment.placements.map((placement) => ({
        id: placement.id,
        type: placement.type,
        slug: placement.slug,
        courseId: placement.courseId,
        lessonId: placement.lessonId,
        isFeatured: placement.isFeatured,
        openTime: placement.openTime,
        closeTime: placement.closeTime,
        maxAttempts: placement.maxAttempts
      })),
      sections: assessment.sections.map((section) => ({
        id: section.id,
        title: section.title,
        description: section.description,
        itemType: section.itemType,
        orderIndex: section.orderIndex,
        items: section.items.map((item, index) => ({
          id: item.id,
          orderIndex: item.orderIndex,
          questionNumber: index + 1,
          itemType: item.itemType,
          topicId: item.topicId,
          topicName: item.topic?.name ?? null,
          difficulty: item.difficulty,
          maxScore: item.maxScore.toString(),
          scoringConfig: item.scoringConfig,
          correctAnswer: item.correctAnswer,
          explanation: item.explanation,
          question: item.question
            ? {
                id: item.question.id,
                content: item.question.content,
                explanation: item.question.explanation,
                options: item.question.options.map((option) => ({
                  id: option.id,
                  content: option.content,
                  isCorrect: option.isCorrect,
                  orderIndex: option.orderIndex
                }))
              }
            : null
        }))
      }))
    }
  }

  async listGradingSubmissions(data: {
    actor: AssessmentActorDto
    assessmentId?: string
    page: number
    limit: number
  }) {
    const [items, totalItems] = await this.repository.listGradingSubmissions({
      actor: data.actor,
      assessmentId: data.assessmentId,
      skip: (data.page - 1) * data.limit,
      take: data.limit
    })

    return {
      items: items.map((item) => ({
        id: item.id,
        assessmentId: item.assessmentId,
        placementId: item.placementId,
        attemptNumber: item.attemptNumber,
        status: item.status,
        submitTime: item.submitTime,
        autoScore: item.autoScore?.toString() ?? null,
        finalScore: item.finalScore?.toString() ?? null,
        assessment: {
          id: item.assessment.id,
          title: item.assessment.title,
          gradingType: item.assessment.gradingType,
          subject: item.assessment.subject,
          grade: item.assessment.grade
        },
        student: item.student,
        essayCount: item.essayAnswers.length,
        gradedEssayCount: item.essayAnswers.filter((answer) => answer.teacherScore !== null).length
      })),
      pagination: {
        page: data.page,
        limit: data.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / data.limit)
      }
    }
  }

  async getGradingSubmission(actor: AssessmentActorDto, submissionId: string) {
    const submissionRecord = await this.repository.findSubmissionForGrading(submissionId)
    const submission = ensureSubmissionForGradingExists(submissionRecord)

    const assessmentEntity = new Assessment(submission.assessment as any)
    if (!assessmentEntity.canGrade(actor, submission.placement)) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You cannot grade this submission')
    }

    return {
      id: submission.id,
      assessmentId: submission.assessmentId,
      placementId: submission.placementId,
      attemptNumber: submission.attemptNumber,
      status: submission.status,
      submitTime: submission.submitTime,
      autoScore: submission.autoScore?.toString() ?? null,
      finalScore: submission.finalScore?.toString() ?? null,
      student: submission.student,
      assessment: {
        id: submission.assessment.id,
        title: submission.assessment.title,
        gradingType: submission.assessment.gradingType,
        subject: submission.assessment.subject,
        grade: submission.assessment.grade
      },
      sections: submission.assessment.sections.map((section) => ({
        id: section.id,
        title: section.title,
        description: section.description,
        itemType: section.itemType,
        orderIndex: section.orderIndex,
        items: section.items.map((item, index) => ({
          id: item.id,
          itemType: item.itemType,
          orderIndex: item.orderIndex,
          questionNumber: index + 1,
          maxScore: item.maxScore.toString(),
          scoringConfig: item.scoringConfig,
          question: item.question
            ? {
                id: item.question.id,
                content: item.question.content,
                options: item.question.options.map((option) => ({
                  id: option.id,
                  content: option.content,
                  orderIndex: option.orderIndex,
                  isCorrect: option.isCorrect
                }))
              }
            : null
        }))
      })),
      essayAnswers: submission.essayAnswers.map((answer) => ({
        id: answer.id,
        itemId: answer.itemId,
        answer: answer.answer,
        teacherScore: answer.teacherScore?.toString() ?? null,
        teacherNote: answer.teacherNote,
        gradedAt: answer.gradedAt
      }))
    }
  }

  async createAssessment(actor: AssessmentActorDto, data: CreateAssessmentDto) {
    if (data.sourceMediaId) {
      const media = await this.repository.findDocumentMediaById(data.sourceMediaId)

      if (!media) {
        throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'sourceMediaId must be a ready PDF document')
      }
    }

    return this.repository.createAssessment({
      ...data,
      createdById: actor.id
    })
  }

  async updateAssessment(actor: AssessmentActorDto, assessmentId: string, data: Partial<CreateAssessmentDto>) {
    const assessmentRecord = await this.repository.findAssessmentById(assessmentId)
    const assessment = ensureAssessmentExists(assessmentRecord)

    const assessmentEntity = new Assessment(assessment as any)
    if (!assessmentEntity.canManage(actor)) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only manage assessments you created')
    }

    if (data.type !== undefined && data.type !== assessment.type) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Assessment type cannot be changed after creation')
    }

    if (assessment._count.submissions > 0) {
      const sensitiveFields: Array<keyof CreateAssessmentDto> = [
        'subject',
        'grade',
        'type',
        'gradingType',
        'sourceMediaId'
      ]
      const hasSensitiveChange = sensitiveFields.some((field) => data[field] !== undefined)

      if (hasSensitiveChange) {
        throw new AppError(
          409,
          ERROR_CODE.CONFLICT,
          'Assessment has submissions. Clone it or use answer key correction flow in phase 2.'
        )
      }
    }

    if (data.sourceMediaId) {
      const media = await this.repository.findDocumentMediaById(data.sourceMediaId)

      if (!media) {
        throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'sourceMediaId must be a ready PDF document')
      }
    }

    if (data.gradingType && data.gradingType !== assessment.gradingType) {
      Assessment.validateSectionsCompatibleWithGradingType(data.gradingType, assessment.sections)
    }

    return this.repository.updateAssessment(assessmentId, data)
  }

  async createPlacement(actor: AssessmentActorDto, data: CreatePlacementDto) {
    const assessmentRecord = await this.repository.findAssessmentById(data.assessmentId)
    const assessment = ensureAssessmentExists(assessmentRecord)

    const assessmentEntity = new Assessment(assessment as any)
    if (!assessmentEntity.canManagePlacement(actor, assessment.placements)) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You cannot manage this assessment placement')
    }
    ensureNonOwnerKeepsPlacementTarget(actor, assessment, data)

    let course = null
    if (data.type === AssessmentPlacementType.course && data.courseId) {
      course = await this.repository.findCourseForPlacement(data.courseId)
    }
    let lesson = null
    if (data.type === AssessmentPlacementType.lesson && data.lessonId) {
      lesson = await this.repository.findLessonForPlacement(data.lessonId)
    }
    ensurePlacementTargetIsValid(actor, assessment, data, course, lesson)

    const placement = await this.repository.upsertSinglePlacement(data.assessmentId, {
      type: data.type,
      courseId: data.courseId,
      lessonId: data.lessonId,
      openTime: data.openTime,
      closeTime: data.closeTime,
      maxAttempts: data.maxAttempts,
      slug: data.slug,
      isFeatured: data.isFeatured
    })
    return mapPlacementSummary(placement)
  }

  async upsertPlacement(
    actor: AssessmentActorDto,
    assessmentId: string,
    data: Omit<CreatePlacementDto, 'assessmentId'>
  ) {
    const assessmentRecord = await this.repository.findAssessmentById(assessmentId)
    const assessment = ensureAssessmentExists(assessmentRecord)

    const assessmentEntity = new Assessment(assessment as any)
    if (!assessmentEntity.canManagePlacement(actor, assessment.placements)) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You cannot manage this assessment placement')
    }
    ensureNonOwnerKeepsPlacementTarget(actor, assessment, data)

    let course = null
    if (data.type === AssessmentPlacementType.course && data.courseId) {
      course = await this.repository.findCourseForPlacement(data.courseId)
    }
    let lesson = null
    if (data.type === AssessmentPlacementType.lesson && data.lessonId) {
      lesson = await this.repository.findLessonForPlacement(data.lessonId)
    }
    ensurePlacementTargetIsValid(actor, assessment, { ...data, assessmentId }, course, lesson)

    const placement = await this.repository.upsertSinglePlacement(assessmentId, data)
    return mapPlacementSummary(placement)
  }

  async deletePlacement(actor: AssessmentActorDto, assessmentId: string) {
    const assessmentRecord = await this.repository.findAssessmentById(assessmentId)
    const assessment = ensureAssessmentExists(assessmentRecord)

    const assessmentEntity = new Assessment(assessment as any)
    if (!assessmentEntity.canManage(actor)) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only manage assessments you created')
    }
    await this.repository.deleteSinglePlacement(assessmentId)

    return {
      assessmentId,
      placementDeleted: true
    }
  }

  async createSection(
    actor: AssessmentActorDto,
    assessmentId: string,
    data: CreateAssessmentSectionDto
  ) {
    const assessmentRecord = await this.repository.findAssessmentById(assessmentId)
    const assessment = ensureAssessmentExists(assessmentRecord)

    const assessmentEntity = new Assessment(assessment as any)
    if (!assessmentEntity.canManage(actor)) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only edit assessment content you own')
    }
    if ((assessment._count?.submissions ?? 0) > 0) {
      throw new AppError(409, ERROR_CODE.CONFLICT, 'Assessment content is locked after submissions exist')
    }
    Assessment.validateSectionItemTypeAllowedByGradingType(assessment.gradingType, data.itemType)

    return this.repository.createSection({
      assessmentId,
      title: data.title,
      description: data.description,
      itemType: data.itemType
    })
  }

  async updateSection(
    actor: AssessmentActorDto,
    assessmentId: string,
    sectionId: string,
    data: { title?: string; description?: string | null }
  ) {
    const assessmentRecord = await this.repository.findAssessmentById(assessmentId)
    const assessment = ensureAssessmentExists(assessmentRecord)

    const assessmentEntity = new Assessment(assessment as any)
    if (!assessmentEntity.canManage(actor)) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only edit assessment content you own')
    }
    if ((assessment._count?.submissions ?? 0) > 0) {
      throw new AppError(409, ERROR_CODE.CONFLICT, 'Assessment content is locked after submissions exist')
    }

    ensureSectionExists(assessment, sectionId)

    return this.repository.updateSection({
      assessmentId,
      sectionId,
      ...data
    })
  }

  async deleteSection(actor: AssessmentActorDto, assessmentId: string, sectionId: string) {
    const assessmentRecord = await this.repository.findAssessmentById(assessmentId)
    const assessment = ensureAssessmentExists(assessmentRecord)

    const assessmentEntity = new Assessment(assessment as any)
    if (!assessmentEntity.canManage(actor)) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only edit assessment content you own')
    }
    if ((assessment._count?.submissions ?? 0) > 0) {
      throw new AppError(409, ERROR_CODE.CONFLICT, 'Assessment content is locked after submissions exist')
    }

    const section = ensureSectionExists(assessment, sectionId)

    if (section.items.length > 0) {
      throw new AppError(409, ERROR_CODE.CONFLICT, 'Cannot delete a section that still has items')
    }

    await this.repository.deleteSection(assessmentId, sectionId)
    return { sectionId, deleted: true }
  }

  async createSectionItems(
    actor: AssessmentActorDto,
    assessmentId: string,
    sectionId: string,
    data: CreateAssessmentItemsDto
  ) {
    const assessmentRecord = await this.repository.findAssessmentById(assessmentId)
    const assessment = ensureAssessmentExists(assessmentRecord)

    const assessmentEntity = new Assessment(assessment as any)
    if (!assessmentEntity.canManage(actor)) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only edit assessment content you own')
    }
    if ((assessment._count?.submissions ?? 0) > 0) {
      throw new AppError(409, ERROR_CODE.CONFLICT, 'Assessment content is locked after submissions exist')
    }

    const section = ensureSectionBelongsToAssessment(assessment, sectionId)

    if (assessment.type === AssessmentType.exam && !assessment.sourceMediaId) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Exam item creation requires a PDF source media')
    }

    Assessment.validateSectionItemTypeAllowedByGradingType(assessment.gradingType, section.itemType)
    Assessment.validateSectionItemsMatchAssessmentMode(assessment.type, section.itemType, data.items)
    Assessment.validateImportItemsAreValid(
      data.items.map((item) => ({ ...item, itemType: section.itemType })),
      assessment.type
    )

    if (data.courseId) {
      const course = await this.repository.findCourseForPlacement(data.courseId)
      const courseTopics = await this.repository.listTopicsByCourse(data.courseId)
      ensureItemsCanUseCourseTopics(assessment, data.items, course, courseTopics)
    }

    const createdItems = await this.repository.createSectionItems({
      assessmentId,
      sectionId,
      assessmentType: assessment.type,
      items: data.items,
      courseId: data.courseId
    })

    if (!createdItems) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Section does not belong to this assessment')
    }

    return createdItems
  }

  async updateSectionItem(
    actor: AssessmentActorDto,
    assessmentId: string,
    itemId: string,
    data: Partial<CreateAssessmentItemsDto['items'][number]>
  ) {
    const assessmentRecord = await this.repository.findAssessmentById(assessmentId)
    const assessment = ensureAssessmentExists(assessmentRecord)

    const assessmentEntity = new Assessment(assessment as any)
    if (!assessmentEntity.canManage(actor)) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only edit assessment content you own')
    }
    if ((assessment._count?.submissions ?? 0) > 0) {
      throw new AppError(409, ERROR_CODE.CONFLICT, 'Assessment content is locked after submissions exist')
    }

    const item = ensureItemExists(assessment, itemId)

    Assessment.validateSectionItemTypeAllowedByGradingType(assessment.gradingType, item.itemType)

    const updated = await this.repository.updateSectionItem({
      assessmentId,
      itemId,
      item: data
    })

    if (!updated) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment item not found')
    }

    return updated
  }

  async deleteSectionItem(actor: AssessmentActorDto, assessmentId: string, itemId: string) {
    const assessmentRecord = await this.repository.findAssessmentById(assessmentId)
    const assessment = ensureAssessmentExists(assessmentRecord)

    const assessmentEntity = new Assessment(assessment as any)
    if (!assessmentEntity.canManage(actor)) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only edit assessment content you own')
    }
    if ((assessment._count?.submissions ?? 0) > 0) {
      throw new AppError(409, ERROR_CODE.CONFLICT, 'Assessment content is locked after submissions exist')
    }

    const deleted = await this.repository.deleteSectionItem(assessmentId, itemId)

    if (!deleted) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment item not found')
    }

    return { itemId, deleted: true }
  }

  async publishAssessment(actor: AssessmentActorDto, assessmentId: string) {
    const assessmentRecord = await this.repository.findAssessmentForPublish(assessmentId)
    const assessment = ensureAssessmentForPublishExists(assessmentRecord)

    const assessmentEntity = new Assessment(assessment as any)
    if (!assessmentEntity.canManage(actor)) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only manage assessments you created')
    }
    assessmentEntity.validateCanPublish()

    return this.repository.publishAssessment(assessmentId)
  }

  async updateVisibility(
    actor: AssessmentActorDto,
    assessmentId: string,
    visibility: AssessmentVisibility
  ) {
    const assessmentRecord = await this.repository.findAssessmentForPublish(assessmentId)
    const assessment = ensureAssessmentForPublishExists(assessmentRecord)

    const assessmentEntity = new Assessment(assessment as any)
    if (!assessmentEntity.canManage(actor)) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only manage assessments you created')
    }

    if (visibility === AssessmentVisibility.published) {
      assessmentEntity.validateCanPublish()
    }

    if (visibility === AssessmentVisibility.draft && assessment._count.submissions > 0) {
      throw new AppError(
        400,
        ERROR_CODE.BAD_REQUEST,
        'Assessment with submissions cannot be moved back to draft'
      )
    }

    return this.repository.updateVisibility(assessmentId, visibility)
  }

  async cloneAssessment(actor: AssessmentActorDto, assessmentId: string, data: CloneAssessmentDto) {
    const sourceRecord = await this.repository.findAssessmentForPublish(assessmentId)
    const source = ensureAssessmentForPublishExists(sourceRecord)

    const isPublicPractice = source.placements.some(
      (placement) => placement.type === AssessmentPlacementType.public_practice
    )

    if (!isPublicPractice) {
      const assessmentEntity = new Assessment(source as any)
      if (!assessmentEntity.canView(actor, source.placements)) {
        throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You cannot view this assessment')
      }
    }

    const title = data.title?.trim() || `${source.title} (Copy)`
    const cloned = await this.repository.cloneAssessment({
      assessmentId,
      createdById: actor.id,
      title
    })

    if (!cloned) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment not found')
    }

    return {
      id: cloned.id
    }
  }

  async gradeEssay(data: GradeEssayDto & { actor: AssessmentActorDto; gradedBy: string }) {
    const submissionRecord = await this.repository.findSubmissionForGrading(data.submissionId)
    const submission = ensureSubmissionForGradingExists(submissionRecord)

    const assessmentEntity = new Assessment(submission.assessment as any)
    if (!assessmentEntity.canGrade(data.actor, submission.placement)) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You cannot grade this submission')
    }

    if (submission.status === SubmissionStatus.doing) {
      throw new AppError(409, ERROR_CODE.CONFLICT, 'Submission has not been submitted')
    }

    const item = flattenSections(submission.assessment.sections).find((assessmentItem) => assessmentItem.id === data.itemId)

    if (!item || item.itemType !== AssessmentItemType.essay) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Essay item not found in submission')
    }

    if (data.teacherScore > Number(item.maxScore)) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Teacher score cannot exceed item maxScore')
    }

    return this.repository.gradeEssay(data)
  }

  async finalizeManualSubmission(data: { actor: AssessmentActorDto; submissionId: string }) {
    const submissionRecord = await this.repository.findSubmissionForGrading(data.submissionId)
    const submission = ensureSubmissionForGradingExists(submissionRecord)

    const assessmentEntity = new Assessment(submission.assessment as any)
    if (!assessmentEntity.canGrade(data.actor, submission.placement)) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You cannot grade this submission')
    }

    if (submission.status === SubmissionStatus.doing) {
      throw new AppError(409, ERROR_CODE.CONFLICT, 'Submission has not been submitted')
    }

    if (submission.assessment.gradingType === GradingType.auto) {
      throw new AppError(409, ERROR_CODE.CONFLICT, 'Auto assessment does not require manual finalize')
    }

    const essayItemIds = flattenSections(submission.assessment.sections)
      .filter((item) => item.itemType === AssessmentItemType.essay)
      .map((item) => item.id)
    const gradedEssayAnswers = submission.essayAnswers.filter((answer) =>
      essayItemIds.includes(answer.itemId)
    )

    if (
      gradedEssayAnswers.length !== essayItemIds.length ||
      gradedEssayAnswers.some((answer) => answer.teacherScore === null)
    ) {
      throw new AppError(409, ERROR_CODE.CONFLICT, 'All essay answers must be graded before finalize')
    }

    const essayScore = gradedEssayAnswers.reduce(
      (sum, answer) => addScores(sum, answer.teacherScore),
      zeroScore()
    )
    const finalScore = addScores(submission.autoScore, essayScore)

    const updatedSubmission = await this.repository.finalizeSubmission(submission.id, finalScore)

    // return mapped submission
    return {
      id: updatedSubmission.id,
      assessmentId: updatedSubmission.assessmentId,
      placementId: updatedSubmission.placementId,
      attemptNumber: updatedSubmission.attemptNumber,
      status: updatedSubmission.status,
      startTime: updatedSubmission.startTime,
      submitTime: updatedSubmission.submitTime,
      autoScore: updatedSubmission.autoScore?.toString() ?? null,
      finalScore: updatedSubmission.finalScore?.toString() ?? null,
      answers: {
        mcq: (updatedSubmission.mcqAnswers ?? []).map((answer) => ({
          itemId: answer.itemId,
          selectedOptionIds: answer.selectedOptions.map((option) => option.optionId)
        })),
        trueFalse: (updatedSubmission.tfAnswers ?? []).map((answer) => ({
          itemId: answer.itemId,
          optionId: answer.optionId,
          selectedValue: answer.selectedValue
        })),
        numeric: (updatedSubmission.numericAnswers ?? []).map((answer) => ({
          itemId: answer.itemId,
          answerValue: answer.answerValue.toString()
        })),
        essay: (updatedSubmission.essayAnswers ?? []).map((answer) => ({
          itemId: answer.itemId,
          answer: answer.answer
        }))
      }
    }
  }
}
