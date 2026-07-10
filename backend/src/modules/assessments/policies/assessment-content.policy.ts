import {
  AssessmentItemType,
  AssessmentPlacementType,
  AssessmentType,
  GradingType,
  MediaStatus,
  MediaType
} from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

import type { CreateAssessmentItemDto } from '../dto'
import type { AssessmentForPublishDetail, AssessmentItemUnion } from '../types'

const objectiveItemTypes = new Set<AssessmentItemType>([
  AssessmentItemType.mcq,
  AssessmentItemType.true_false,
  AssessmentItemType.numeric
])

// Ném lỗi validation thống nhất cho nội dung assessment không hợp lệ.
const invalidAssessment = (message: string): never => {
  throw new AppError(400, ERROR_CODE.BAD_REQUEST, message)
}

// Kiểm tra loại section có phù hợp với kiểu chấm điểm không.
export function validateSectionType(
  gradingType: GradingType,
  itemType: AssessmentItemType
): void {
  if (gradingType === GradingType.auto && itemType === AssessmentItemType.essay) {
    invalidAssessment('Auto assessment cannot contain essay sections')
  }

  if (gradingType === GradingType.manual && itemType !== AssessmentItemType.essay) {
    invalidAssessment('Manual assessment can only contain essay sections')
  }
}

// Kiểm tra toàn bộ section có phù hợp với kiểu chấm điểm không.
export function validateSectionsForGrading(
  gradingType: GradingType,
  sections: Array<{ itemType: AssessmentItemType }>
): void {
  for (const section of sections) {
    validateSectionType(gradingType, section.itemType)
  }
}

// Kiểm tra các câu hỏi import có đủ đáp án, điểm và cấu trúc hợp lệ.
export function validateImportedItems(
  items: Array<CreateAssessmentItemDto & { itemType: AssessmentItemType }>
): void {
  for (const item of items) {
    const data = item as AssessmentItemUnion

    if (item.maxScore === undefined || item.maxScore <= 0) {
      invalidAssessment('Item maxScore must be positive')
    }

    if (item.itemType === AssessmentItemType.mcq) {
      const isExamMcq = 'optionCount' in data && typeof data.optionCount === 'number'
      const optionLabels = isExamMcq
        ? Array.from({ length: data.optionCount || 0 }, (_, index) =>
            String.fromCharCode(65 + index)
          )
        : (data.options || []).map((option) => option.content || '')
      const optionSet = new Set(optionLabels)
      const correctOptions = isExamMcq
        ? data.correctOptions || []
        : (data.options || [])
            .map((option, index) => (option.isCorrect ? optionLabels[index] : null))
            .filter((option): option is string => Boolean(option))
      const correctSet = new Set(correctOptions)

      if (optionLabels.length < 2 || optionSet.size !== optionLabels.length) {
        invalidAssessment('MCQ options must be unique and at least 2')
      }

      if (correctSet.size === 0) {
        invalidAssessment('MCQ must have at least one correct option')
      }

      if (!isExamMcq && data.mode === 'single' && correctSet.size !== 1) {
        invalidAssessment('Single-answer MCQ must have one correct option')
      }

      for (const correctOption of correctSet) {
        if (!optionSet.has(correctOption)) {
          invalidAssessment('Correct MCQ option must exist in options')
        }
      }
    }

    if (item.itemType === AssessmentItemType.true_false && (data.statements || []).length === 0) {
      invalidAssessment('True/False item must have statements')
    }
  }
}

// Kiểm tra payload item theo chế độ quiz nhập câu hỏi hoặc exam nhập đáp án.
export function validateItemsForMode(
  assessmentType: AssessmentType,
  itemType: AssessmentItemType,
  items: unknown[]
): void {
  for (const rawItem of items) {
    const item = rawItem as Record<string, unknown>

    if (assessmentType === AssessmentType.quiz && typeof item.contentLabel !== 'string') {
      invalidAssessment('Quiz item requires contentLabel')
    }

    if (itemType === AssessmentItemType.mcq) {
      if (assessmentType === AssessmentType.quiz) {
        if (!Array.isArray(item.options) || !['single', 'multiple'].includes(String(item.mode))) {
          invalidAssessment('Quiz MCQ requires options and mode')
        }
      } else if (!Number.isInteger(item.optionCount) || !Array.isArray(item.correctOptions)) {
        invalidAssessment('Exam MCQ requires optionCount and correctOptions')
      }
    }

    if (itemType === AssessmentItemType.true_false && !Array.isArray(item.statements)) {
      invalidAssessment('True/False item requires statements')
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
      invalidAssessment('Quiz true/false statements require labels')
    }

    if (itemType === AssessmentItemType.numeric && typeof item.correctAnswer !== 'number') {
      invalidAssessment('Numeric item requires correctAnswer')
    }
  }
}

// Kiểm tra assessment đã đủ điều kiện để publish cho học sinh làm.
// Assessment phải có ít nhất 1 section, mỗi section phải có ít nhất 1 item, và các item phải hợp lệ.
// Exam assessment phải có source media là PDF, và các placement phải hợp lệ.
// Mixed assessment phải có ít nhất 1 section essay và 1 section objective.
// Nếu không hợp lệ, ném lỗi AppError với status 400 và code BAD_REQUEST.

export function validateAssessmentCanPublish(assessment: AssessmentForPublishDetail): void {
  if (assessment.sections.length === 0) {
    invalidAssessment('Assessment must have at least one section before publish')
  }

  if (assessment.sections.some((section) => section.items.length === 0)) {
    invalidAssessment('Every assessment section must have at least one item before publish')
  }

  validateSectionsForGrading(assessment.gradingType, assessment.sections)

  if (assessment.gradingType === GradingType.mixed) {
    const hasEssay = assessment.sections.some(
      (section) => section.itemType === AssessmentItemType.essay
    )
    const hasObjective = assessment.sections.some((section) =>
      objectiveItemTypes.has(section.itemType)
    )

    if (!hasEssay || !hasObjective) {
      invalidAssessment('Mixed assessment must contain objective sections and essay sections')
    }
  }

  if (assessment.placements.length === 0) {
    invalidAssessment('Assessment must have at least one placement before publish')
  }

  if (assessment.type === AssessmentType.exam) {
    const sourceMedia = assessment.sourceMedia

    if (!assessment.sourceMediaId || !sourceMedia) {
      throw new AppError(
        400,
        ERROR_CODE.BAD_REQUEST,
        'Exam assessment requires a PDF source media'
      )
    }

    if (
      sourceMedia.type !== MediaType.document ||
      sourceMedia.status !== MediaStatus.ready ||
      sourceMedia.mimeType !== 'application/pdf'
    ) {
      invalidAssessment('Exam source media must be a ready PDF document')
    }
  }

  for (const placement of assessment.placements) {
    if (placement.type === AssessmentPlacementType.public_practice && !placement.slug) {
      invalidAssessment('Public practice placement requires slug')
    }
  }

  for (const item of assessment.sections.flatMap((section) => section.items)) {
    if (item.itemType === AssessmentItemType.essay) {
      continue
    }

    const question = item.question

    if (!item.questionId || !question) {
      throw new AppError(
        400,
        ERROR_CODE.BAD_REQUEST,
        'Auto-graded item requires generated question'
      )
    }

    // Strict validation for draft content during publish

    // 1. Check contentLabel for Quiz items
    if (assessment.type === AssessmentType.quiz) {
      const qContent = question.content as { label?: string } | null
      if (!qContent?.label || !qContent.label.trim()) {
        invalidAssessment('Quiz item requires contentLabel')
      }
    }

    // 2. Validate MCQ
    if (item.itemType === AssessmentItemType.mcq) {
      const correctCount = question.options.filter((option) => option.isCorrect).length

      if (question.options.length < 2) {
        invalidAssessment('MCQ item requires at least 2 options')
      }
      if (correctCount === 0) {
        invalidAssessment('MCQ must have at least one correct option')
      }

      const config = item.scoringConfig as { mode?: string } | null
      if (config?.mode !== 'multiple' && correctCount !== 1) {
        invalidAssessment('Single-answer MCQ requires exactly one correct option')
      }

      // Check unique and non-empty option labels/contents
      const optionTexts = question.options.map((option) => {
        const optContent = option.content as { label?: string } | null
        return optContent?.label?.trim() || ''
      })
      if (optionTexts.some((text) => !text)) {
        invalidAssessment('Quiz MCQ options cannot be empty')
      }
      const uniqueTexts = new Set(optionTexts)
      if (uniqueTexts.size !== optionTexts.length) {
        invalidAssessment('MCQ options must be unique')
      }
    }

    // 3. Validate True/False
    if (item.itemType === AssessmentItemType.true_false) {
      if (question.options.length === 0 || !item.scoringConfig) {
        invalidAssessment('True/False item requires statements and scoring config')
      }

      const optionTexts = question.options.map((option) => {
        const optContent = option.content as { label?: string } | null
        return optContent?.label?.trim() || ''
      })

      if (assessment.type === AssessmentType.quiz) {
        if (optionTexts.some((text) => !text)) {
          invalidAssessment('Quiz true/false statements require labels')
        }
      }
    }

    // 4. Validate Numeric
    if (item.itemType === AssessmentItemType.numeric) {
      const answer = item.correctAnswer as { value?: number } | null
      if (answer?.value === undefined || answer?.value === null || !item.scoringConfig) {
        invalidAssessment('Numeric item requires correct answer and scoring config')
      }
    }
  }
}
