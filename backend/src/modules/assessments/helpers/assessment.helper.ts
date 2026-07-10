import {
  AssessmentItemType,
  AssessmentType,
  Prisma,
  QuestionType
} from '@prisma/client'
import type { CreateAssessmentItemDto } from '../dto'
import type { AssessmentItemUnion } from '../types'

// Chuyển số/chuỗi điểm sang Decimal để tính điểm chính xác.
export const toDecimal = (value: number | string) => new Prisma.Decimal(value)

// Đổi vị trí đáp án thành nhãn A, B, C... cho đề thi dạng PDF.
export const toExamOptionLabel = (index: number) => String.fromCharCode(65 + index)

// Tạo nội dung câu hỏi phù hợp giữa quiz nhập trực tiếp và exam theo số câu.
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

// Tạo tham chiếu nguồn câu hỏi trong PDF/đề gốc.
export const buildSourceRef = (
  assessmentId: string,
  sectionId: string,
  itemType: AssessmentItemType
): Prisma.InputJsonValue => ({
  assessmentId,
  sectionId,
  itemType
})

// Đóng gói phần giải thích đáp án thành JSON lưu trong assessment item.
export const buildExplanation = (item: Partial<CreateAssessmentItemDto>): Prisma.InputJsonValue | undefined => {
  const data = item as AssessmentItemUnion
  const explanation = data.explanation?.trim()
  return explanation ? explanation : undefined
}

// Tạo đáp án đúng theo từng loại câu hỏi.
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

// Tạo cấu hình chấm điểm theo từng loại câu hỏi.
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

// Quy đổi loại item assessment sang loại question dùng chung.
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

// Chuẩn hóa tên chủ đề để tránh lệch do khoảng trắng thừa.
export const normalizeTopicName = (value: string) => value.trim().replace(/\s+/g, ' ')
