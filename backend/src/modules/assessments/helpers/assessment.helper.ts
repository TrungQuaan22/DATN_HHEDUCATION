import {
  AssessmentItemType,
  AssessmentType,
  Prisma,
  QuestionType
} from '@prisma/client'
import type { CreateAssessmentItemDto } from '../dto'
import type { AssessmentItemUnion } from '../types'

export const toDecimal = (value: number | string) => new Prisma.Decimal(value)

export const toExamOptionLabel = (index: number) => String.fromCharCode(65 + index)

export const buildQuestionContent = (
  item: Partial<CreateAssessmentItemDto>,
  mode: AssessmentType,
  itemType: AssessmentItemType
): Prisma.InputJsonValue => {
  const data = item as AssessmentItemUnion
  if (mode === 'exam') {
    return {
      kind: 'pdf_exam_answer_key',
      itemType
    }
  }

  return {
    kind: 'quiz_question',
    label: data.contentLabel ?? ''
  }
}

export const buildSourceRef = (
  assessmentId: string,
  sectionId: string,
  itemType: AssessmentItemType
): Prisma.InputJsonValue => ({
  assessmentId,
  sectionId,
  itemType
})

export const buildExplanation = (item: Partial<CreateAssessmentItemDto>): Prisma.InputJsonValue | undefined => {
  const data = item as AssessmentItemUnion
  const explanation = data.explanation?.trim()
  return explanation ? explanation : undefined
}

export const buildCorrectAnswer = (
  item: Partial<CreateAssessmentItemDto>,
  itemType: AssessmentItemType
): Prisma.InputJsonValue | undefined => {
  const data = item as AssessmentItemUnion

  if (itemType === AssessmentItemType.mcq) {
    return {
      correctOptions:
        data.correctOptions ??
        data.options
          ?.map((option, index) => (option.isCorrect ? toExamOptionLabel(index) : null))
          .filter((option): option is string => Boolean(option)) ?? []
    }
  }

  if (itemType === AssessmentItemType.true_false) {
    return {
      statements: data.statements?.map((statement, index) => ({
        orderIndex: index,
        label: 'label' in statement && statement.label ? statement.label : `Mệnh đề ${index + 1}`,
        correctValue: statement.correctValue
      })) ?? []
    }
  }

  if (itemType === AssessmentItemType.numeric) {
    return {
      value: data.correctAnswer
    }
  }

  return undefined
}

export const buildScoringConfig = (
  item: Partial<CreateAssessmentItemDto>,
  itemType: AssessmentItemType
): Prisma.InputJsonValue => {
  const data = item as AssessmentItemUnion

  if (itemType === AssessmentItemType.mcq) {
    return {
      mode: data.mode ?? (data.correctOptions && data.correctOptions.length > 1 ? 'multiple' : 'single'),
      allOrNothing: true
    }
  }

  if (itemType === AssessmentItemType.true_false) {
    return {
      partialCredit: 'correct_count_ratio',
      specialFourStatementScale: true
    }
  }

  if (itemType === AssessmentItemType.numeric) {
    return {
      mode: 'exact'
    }
  }

  return {
    rubric: data.rubric ?? null,
    manual: true
  }
}

export const toQuestionType = (itemType: AssessmentItemType): QuestionType => {
  if (itemType === AssessmentItemType.mcq) {
    return QuestionType.mcq
  }

  if (itemType === AssessmentItemType.true_false) {
    return QuestionType.true_false
  }

  if (itemType === AssessmentItemType.numeric) {
    return QuestionType.numeric
  }

  return QuestionType.essay
}

export const normalizeTopicName = (value: string) => value.trim().replace(/\s+/g, ' ')
