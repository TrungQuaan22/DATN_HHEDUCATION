import {
  AssessmentItemType,
  AssessmentPlacementType,
  AssessmentType,
  GradingType,
  MediaStatus,
  MediaType,
  UserRole
} from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

import type { CreateAssessmentItemDto } from '../dto'
import type { AssessmentItemUnion } from '../types'

export type AssessmentActor = {
  id: string
  role: UserRole
}

export type PlacementAccess = {
  type: AssessmentPlacementType
  course?: { teacherId: string } | null
  lesson?: {
    chapter?: {
      course?: { teacherId: string } | null
    } | null
  } | null
}

const objectiveItemTypes = new Set<AssessmentItemType>([
  AssessmentItemType.mcq,
  AssessmentItemType.true_false,
  AssessmentItemType.numeric
])

const toExamOptionLabel = (index: number) => String.fromCharCode(65 + index)

export class Assessment {
  readonly id?: string
  readonly type: AssessmentType
  readonly gradingType: GradingType
  readonly createdById?: string | null
  readonly sourceMediaId?: string | null
  readonly sourceMedia?: {
    type: MediaType
    status: MediaStatus
    mimeType: string
  } | null
  readonly placements?: Array<{ type: AssessmentPlacementType; slug: string | null }>
  readonly sections?: Array<{
    itemType: AssessmentItemType
    items: Array<{
      itemType: AssessmentItemType
      questionId: string | null
      correctAnswer: unknown
      scoringConfig: unknown
      question: {
        options: Array<{ isCorrect: boolean }>
      } | null
    }>
  }>

  constructor(data: {
    id?: string
    type: AssessmentType
    gradingType: GradingType
    createdById?: string | null
    sourceMediaId?: string | null
    sourceMedia?: {
      type: MediaType
      status: MediaStatus
      mimeType: string
    } | null
    placements?: Array<{ type: AssessmentPlacementType; slug: string | null }>
    sections?: Array<{
      itemType: AssessmentItemType
      items: Array<{
        itemType: AssessmentItemType
        questionId: string | null
        correctAnswer: unknown
        scoringConfig: unknown
        question: {
          options: Array<{ isCorrect: boolean }>
        } | null
      }>
    }>
  }) {
    this.id = data.id
    this.type = data.type
    this.gradingType = data.gradingType
    this.createdById = data.createdById
    this.sourceMediaId = data.sourceMediaId
    this.sourceMedia = data.sourceMedia
    this.placements = data.placements
    this.sections = data.sections
  }

  // --- Core Permissions (Domain Policies) ---

  private isTeacherCoursePlacement(actor: AssessmentActor, placement: PlacementAccess): boolean {
    if (actor.role !== UserRole.teacher) {
      return false
    }
    return (
      placement.course?.teacherId === actor.id ||
      placement.lesson?.chapter?.course?.teacherId === actor.id
    )
  }

  public canManage(actor: AssessmentActor): boolean {
    return actor.role === UserRole.admin || this.createdById === actor.id
  }

  public canView(actor: AssessmentActor, placements: PlacementAccess[] = []): boolean {
    return (
      this.canManage(actor) ||
      placements.some((placement) => this.isTeacherCoursePlacement(actor, placement))
    )
  }

  public canManageContent(actor: AssessmentActor, submissionsCount: number): boolean {
    return this.canManage(actor) && submissionsCount === 0
  }

  public canManagePlacement(actor: AssessmentActor, placements: PlacementAccess[] = []): boolean {
    return (
      this.canManage(actor) ||
      placements.some((placement) => this.isTeacherCoursePlacement(actor, placement))
    )
  }

  public canGrade(actor: AssessmentActor, placement?: PlacementAccess | null): boolean {
    return (
      this.canManage(actor) ||
      Boolean(placement && this.isTeacherCoursePlacement(actor, placement))
    )
  }

  // --- Content & Grading Validation Checks ---

  static validateItemsMatchGradingType(
    gradingType: GradingType,
    items: Array<{ itemType: AssessmentItemType }>
  ): void {
    if (items.length === 0) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Assessment must have at least one item')
    }

    const hasEssay = items.some((item) => item.itemType === AssessmentItemType.essay)
    const hasObjective = items.some((item) => objectiveItemTypes.has(item.itemType))

    if (gradingType === GradingType.auto && hasEssay) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Auto assessment cannot contain essay items')
    }

    if (gradingType === GradingType.manual && hasObjective) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Manual assessment can only contain essay items')
    }

    if (gradingType === GradingType.mixed && (!hasEssay || !hasObjective)) {
      throw new AppError(
        400,
        ERROR_CODE.BAD_REQUEST,
        'Mixed assessment must contain objective items and essay items'
      )
    }
  }

  static validateSectionItemTypeAllowedByGradingType(
    gradingType: GradingType,
    itemType: AssessmentItemType
  ): void {
    if (gradingType === GradingType.auto && itemType === AssessmentItemType.essay) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Auto assessment cannot contain essay sections')
    }

    if (gradingType === GradingType.manual && itemType !== AssessmentItemType.essay) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Manual assessment can only contain essay sections')
    }
  }

  static validateSectionsCompatibleWithGradingType(
    gradingType: GradingType,
    sections: Array<{ itemType: AssessmentItemType }>
  ): void {
    for (const section of sections) {
      Assessment.validateSectionItemTypeAllowedByGradingType(gradingType, section.itemType)
    }
  }

  static validateSectionsCompleteForPublish(
    gradingType: GradingType,
    sections: Array<{ itemType: AssessmentItemType; items: unknown[] }>
  ): void {
    if (sections.length === 0) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Assessment must have at least one section before publish')
    }

    if (sections.some((section) => section.items.length === 0)) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Every assessment section must have at least one item before publish')
    }

    Assessment.validateSectionsCompatibleWithGradingType(gradingType, sections)

    if (gradingType === GradingType.mixed) {
      const hasEssay = sections.some((section) => section.itemType === AssessmentItemType.essay)
      const hasObjective = sections.some((section) => objectiveItemTypes.has(section.itemType))

      if (!hasEssay || !hasObjective) {
        throw new AppError(
          400,
          ERROR_CODE.BAD_REQUEST,
          'Mixed assessment must contain objective sections and essay sections'
        )
      }
    }
  }

  static validateImportItemsAreValid(
    items: Array<CreateAssessmentItemDto & { itemType: AssessmentItemType }>,
    mode: AssessmentType
  ): void {
    void mode

    for (const item of items) {
      const data = item as AssessmentItemUnion

      if (item.maxScore <= 0) {
        throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Item maxScore must be positive')
      }

      if (item.itemType === 'mcq') {
        const isExamMcq = 'optionCount' in data && typeof data.optionCount === 'number'
        const optionLabels =
          isExamMcq
            ? Array.from({ length: data.optionCount || 0 }, (_, index) => toExamOptionLabel(index))
            : (data.options || []).map((option: { content: string }) => option.content)
        const optionSet = new Set(optionLabels)
        const correctOptions =
          isExamMcq
            ? data.correctOptions || []
            : (data.options || [])
                .map((option, index) => (option.isCorrect ? optionLabels[index] : null))
                .filter((option): option is string => Boolean(option))
        const correctSet = new Set(correctOptions)

        if (optionLabels.length < 2 || optionSet.size !== optionLabels.length) {
          throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'MCQ options must be unique and at least 2')
        }

        if (correctSet.size === 0) {
          throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'MCQ must have at least one correct option')
        }

        if (!isExamMcq && data.mode === 'single' && correctSet.size !== 1) {
          throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Single-answer MCQ must have one correct option')
        }

        for (const correctOption of correctSet) {
          if (!optionSet.has(correctOption)) {
            throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Correct MCQ option must exist in options')
          }
        }
      }

      if (item.itemType === 'true_false' && (data.statements || []).length === 0) {
        throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'True/False item must have statements')
      }
    }
  }

  static validateSectionItemsMatchAssessmentMode(
    assessmentType: AssessmentType,
    itemType: AssessmentItemType,
    items: unknown[]
  ): void {
    for (const rawItem of items) {
      const item = rawItem as Record<string, unknown>

      if (assessmentType === AssessmentType.quiz && typeof item.contentLabel !== 'string') {
        throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Quiz item requires contentLabel')
      }

      if (itemType === AssessmentItemType.mcq) {
        if (assessmentType === AssessmentType.quiz) {
          if (!Array.isArray(item.options) || !['single', 'multiple'].includes(String(item.mode))) {
            throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Quiz MCQ requires options and mode')
          }
        } else if (
          !Number.isInteger(item.optionCount) ||
          !Array.isArray(item.correctOptions)
        ) {
          throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Exam MCQ requires optionCount and correctOptions')
        }
      }

      if (itemType === AssessmentItemType.true_false && !Array.isArray(item.statements)) {
        throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'True/False item requires statements')
      }

      if (
        itemType === AssessmentItemType.true_false &&
        assessmentType === AssessmentType.quiz &&
        Array.isArray(item.statements) &&
        item.statements.some((statement) => {
          const value = statement as Record<string, unknown>
          return typeof value.label !== 'string' || !value.label.trim()
        })
      ) {
        throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Quiz true/false statements require labels')
      }

      if (itemType === AssessmentItemType.numeric && typeof item.correctAnswer !== 'number') {
        throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Numeric item requires correctAnswer')
      }
    }
  }

  public validateCanPublish(): void {
    if (!this.placements || !this.sections) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Assessment is incomplete')
    }

    Assessment.validateSectionsCompleteForPublish(this.gradingType, this.sections)

    if (this.placements.length === 0) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Assessment must have at least one placement before publish')
    }

    if (this.type === AssessmentType.exam) {
      if (!this.sourceMediaId || !this.sourceMedia) {
        throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Exam assessment requires a PDF source media')
      }

      if (
        this.sourceMedia.type !== MediaType.document ||
        this.sourceMedia.status !== MediaStatus.ready ||
        this.sourceMedia.mimeType !== 'application/pdf'
      ) {
        throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Exam source media must be a ready PDF document')
      }
    }

    for (const placement of this.placements) {
      if (placement.type === AssessmentPlacementType.public_practice && !placement.slug) {
        throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Public practice placement requires slug')
      }
    }

    for (const item of this.sections.flatMap((section) => section.items)) {
      if (item.itemType === AssessmentItemType.essay) {
        continue
      }

      if (!item.questionId || !item.question) {
        throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Auto-graded item requires generated question')
      }

      if (item.itemType === AssessmentItemType.mcq) {
        const correctCount = item.question.options.filter((option) => option.isCorrect).length

        if (item.question.options.length < 2 || correctCount === 0) {
          throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'MCQ item requires options and answer key')
        }

        const config = item.scoringConfig as { mode?: string } | null

        if (config?.mode !== 'multiple' && correctCount !== 1) {
          throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Single-answer MCQ requires exactly one correct option')
        }
      }

      if (item.itemType === AssessmentItemType.true_false) {
        if (item.question.options.length === 0 || !item.scoringConfig) {
          throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'True/False item requires statements and scoring config')
        }
      }

      if (item.itemType === AssessmentItemType.numeric) {
        if (!item.correctAnswer || !item.scoringConfig) {
          throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Numeric item requires correct answer and scoring config')
        }
      }
    }
  }
}
