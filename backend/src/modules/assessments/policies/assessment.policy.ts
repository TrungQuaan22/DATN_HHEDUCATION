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

type OwnedAssessment = {
  createdById: string | null
}

type PlacementAccess = {
  type: AssessmentPlacementType
  course?: { teacherId: string } | null
  lesson?: {
    chapter?: {
      course?: { teacherId: string } | null
    } | null
  } | null
}

type AssessmentAccess = OwnedAssessment & {
  placements?: PlacementAccess[]
  _count?: {
    submissions: number
  }
}

type SubmissionAccess = {
  assessment: AssessmentAccess
  placement?: PlacementAccess | null
}

const isTeacherCoursePlacement = (actor: AssessmentActor, placement: PlacementAccess) => {
  if (actor.role !== UserRole.teacher) {
    return false
  }

  return (
    placement.course?.teacherId === actor.id ||
    placement.lesson?.chapter?.course?.teacherId === actor.id
  )
}

export const canManageAssessment = (
  actor: AssessmentActor,
  assessment: OwnedAssessment
) => actor.role === UserRole.admin || assessment.createdById === actor.id

export const ensureCanManageAssessment = (
  actor: AssessmentActor,
  assessment: OwnedAssessment
) => {
  if (!canManageAssessment(actor, assessment)) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only manage assessments you created')
  }
}

export const canViewAssessment = (
  actor: AssessmentActor,
  assessment: AssessmentAccess
) => (
  canManageAssessment(actor, assessment) ||
  Boolean(assessment.placements?.some((placement) => isTeacherCoursePlacement(actor, placement)))
)

export const ensureCanViewAssessment = (
  actor: AssessmentActor,
  assessment: AssessmentAccess
) => {
  if (!canViewAssessment(actor, assessment)) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You cannot view this assessment')
  }
}

export const canManageAssessmentContent = (
  actor: AssessmentActor,
  assessment: AssessmentAccess
) => (
  canManageAssessment(actor, assessment) &&
  (assessment._count?.submissions ?? 0) === 0
)

export const ensureCanManageAssessmentContent = (
  actor: AssessmentActor,
  assessment: AssessmentAccess
) => {
  if (!canManageAssessment(actor, assessment)) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only edit assessment content you own')
  }

  if ((assessment._count?.submissions ?? 0) > 0) {
    throw new AppError(409, ERROR_CODE.CONFLICT, 'Assessment content is locked after submissions exist')
  }
}

export const canManageAssessmentPlacement = (
  actor: AssessmentActor,
  assessment: AssessmentAccess
) => (
  canManageAssessment(actor, assessment) ||
  Boolean(assessment.placements?.some((placement) => isTeacherCoursePlacement(actor, placement)))
)

export const ensureCanManageAssessmentPlacement = (
  actor: AssessmentActor,
  assessment: AssessmentAccess
) => {
  if (!canManageAssessmentPlacement(actor, assessment)) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You cannot manage this assessment placement')
  }
}

export const canGradeSubmission = (
  actor: AssessmentActor,
  submission: SubmissionAccess
) => (
  canManageAssessment(actor, submission.assessment) ||
  Boolean(submission.placement && isTeacherCoursePlacement(actor, submission.placement))
)

export const ensureCanGradeSubmission = (
  actor: AssessmentActor,
  submission: SubmissionAccess
) => {
  if (!canGradeSubmission(actor, submission)) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You cannot grade this submission')
  }
}

const objectiveItemTypes = new Set<AssessmentItemType>([
  AssessmentItemType.mcq,
  AssessmentItemType.true_false,
  AssessmentItemType.numeric
])

export const ensureItemsMatchGradingType = (
  gradingType: GradingType,
  items: Array<{ itemType: AssessmentItemType }>
) => {
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

export const ensureSectionItemTypeAllowedByGradingType = (
  gradingType: GradingType,
  itemType: AssessmentItemType
) => {
  if (gradingType === GradingType.auto && itemType === AssessmentItemType.essay) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Auto assessment cannot contain essay sections')
  }

  if (gradingType === GradingType.manual && itemType !== AssessmentItemType.essay) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Manual assessment can only contain essay sections')
  }
}

export const ensureSectionsCompatibleWithGradingType = (
  gradingType: GradingType,
  sections: Array<{ itemType: AssessmentItemType }>
) => {
  for (const section of sections) {
    ensureSectionItemTypeAllowedByGradingType(gradingType, section.itemType)
  }
}

export const ensureSectionsCompleteForPublish = (
  gradingType: GradingType,
  sections: Array<{ itemType: AssessmentItemType; items: unknown[] }>
) => {
  if (sections.length === 0) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Assessment must have at least one section before publish')
  }

  if (sections.some((section) => section.items.length === 0)) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Every assessment section must have at least one item before publish')
  }

  ensureSectionsCompatibleWithGradingType(gradingType, sections)

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

const toExamOptionLabel = (index: number) => String.fromCharCode(65 + index)

export const ensureImportItemsAreValid = (
  items: Array<CreateAssessmentItemDto & { itemType: AssessmentItemType }>,
  mode: AssessmentType
) => {
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

export const ensureSectionItemsMatchAssessmentMode = (
  assessmentType: AssessmentType,
  itemType: AssessmentItemType,
  items: unknown[]
) => {
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

export const calculateTrueFalseRatio = (correctCount: number, totalCount: number): number => {
  if (totalCount === 4) {
    const ratioByCorrectCount: Record<number, number> = {
      4: 1,
      3: 0.5,
      2: 0.25,
      1: 0.1,
      0: 0
    }

    return ratioByCorrectCount[correctCount] ?? 0
  }

  return totalCount > 0 ? correctCount / totalCount : 0
}

export const isSameSet = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) {
    return false
  }

  const rightSet = new Set(right)
  return left.every((item) => rightSet.has(item))
}

export const ensureAssessmentCanPublish = (assessment: {
  type: AssessmentType
  gradingType: GradingType
  sourceMediaId: string | null
  sourceMedia: {
    type: MediaType
    status: MediaStatus
    mimeType: string
  } | null
  placements: Array<{ type: AssessmentPlacementType; slug: string | null }>
  sections: Array<{
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
}) => {
  ensureSectionsCompleteForPublish(assessment.gradingType, assessment.sections)

  if (assessment.placements.length === 0) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Assessment must have at least one placement before publish')
  }

  if (assessment.type === AssessmentType.exam) {
    if (!assessment.sourceMediaId || !assessment.sourceMedia) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Exam assessment requires a PDF source media')
    }

    if (
      assessment.sourceMedia.type !== MediaType.document ||
      assessment.sourceMedia.status !== MediaStatus.ready ||
      assessment.sourceMedia.mimeType !== 'application/pdf'
    ) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Exam source media must be a ready PDF document')
    }
  }

  for (const placement of assessment.placements) {
    if (placement.type === AssessmentPlacementType.public_practice && !placement.slug) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Public practice placement requires slug')
    }
  }

  for (const item of assessment.sections.flatMap((section) => section.items)) {
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
