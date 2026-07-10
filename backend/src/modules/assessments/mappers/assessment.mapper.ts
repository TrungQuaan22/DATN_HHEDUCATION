import type { Assessment, AssessmentItem } from '@prisma/client'

import { mapMediaUrl } from '~/common/mappers/media.mapper'
import type {
  AssessmentPlacementSummaryResponse,
  AssessmentSummaryResponse,
  RuntimeAssessmentResponse
} from '../dto/assessment.dto'
import type {
  PlacementWithAssessment,
  RuntimePlacement,
  RuntimePreviewPlacement,
  RuntimePreviewSection,
  RuntimeSection,
  SubmissionDetail,
  StudentPlacementListItem
} from '../types'

// Rút gọn thông tin assessment cho các danh sách/placement.
export const mapAssessmentSummary = (
  assessment: Assessment
): AssessmentSummaryResponse => ({
  id: assessment.id,
  title: assessment.title,
  subject: assessment.subject,
  grade: assessment.grade,
  type: assessment.type,
  gradingType: assessment.gradingType,
  visibility: assessment.visibility
})

// Rút gọn thông tin placement để hiển thị nơi assessment được gắn.
export const mapPlacementSummary = (
  placement: PlacementWithAssessment
): AssessmentPlacementSummaryResponse => ({
  id: placement.id,
  type: placement.type,
  slug: placement.slug,
  isFeatured: placement.isFeatured,
  assessment: mapAssessmentSummary(placement.assessment)
})

// Xác định câu MCQ là một đáp án hay nhiều đáp án.
const mapAnswerMode = (item: AssessmentItem): 'single' | 'multiple' | null =>
  item.itemType === 'mcq' &&
  item.scoringConfig &&
  typeof item.scoringConfig === 'object' &&
  !Array.isArray(item.scoringConfig) &&
  'mode' in item.scoringConfig &&
  (item.scoringConfig as { mode?: unknown }).mode === 'multiple'
    ? 'multiple'
    : item.itemType === 'mcq'
      ? 'single'
      : null

// Map section cho màn preview, không lộ đáp án và chi tiết workspace.
const mapPreviewSection = (section: RuntimePreviewSection) => ({
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
    maxScore: item.maxScore.toString(),
    answerMode: mapAnswerMode(item),
    question: null
  }))
})

// Map section cho workspace khi học sinh đang làm bài.
const mapWorkspaceSection = (section: RuntimeSection) => ({
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
    maxScore: item.maxScore.toString(),
    answerMode: mapAnswerMode(item),
    question: item.question
      ? {
          id: item.question.id,
          type: item.question.type,
          content: item.question.content,
          options: item.question.options.map((option) => ({
            id: option.id,
            content: option.content,
            orderIndex: option.orderIndex
          }))
        }
      : null
  }))
})

// Map placement ở chế độ preview trước khi bắt đầu attempt.
export const mapRuntimePlacementPreview = (
  placement: RuntimePreviewPlacement
): RuntimeAssessmentResponse => ({
  ...mapPlacementSummary(placement),
  openTime: placement.openTime,
  closeTime: placement.closeTime,
  maxAttempts: placement.maxAttempts,
  timeLimitMinutes: placement.assessment.timeLimitMinutes,
  sections: placement.assessment.sections.map(mapPreviewSection)
})

// Map placement đầy đủ cho workspace làm bài.
export const mapRuntimePlacement = (
  placement: RuntimePlacement
): RuntimeAssessmentResponse => ({
  ...mapPlacementSummary(placement),
  openTime: placement.openTime,
  closeTime: placement.closeTime,
  maxAttempts: placement.maxAttempts,
  timeLimitMinutes: placement.assessment.timeLimitMinutes,
  sourceMediaId: placement.assessment.sourceMediaId,
  sourceMediaUrl: mapMediaUrl(placement.assessment.sourceMedia?.objectKey),
  sections: placement.assessment.sections.map(mapWorkspaceSection)
})

// Map submission sang shape dùng trong runtime workspace.
export const mapSubmissionForRuntime = (submission: SubmissionDetail) => ({
  id: submission.id,
  assessmentId: submission.assessmentId,
  placementId: submission.placementId,
  attemptNumber: submission.attemptNumber,
  status: submission.status,
  startTime: submission.startTime,
  submitTime: submission.submitTime,
  autoScore: submission.autoScore?.toString() ?? null,
  finalScore: submission.finalScore?.toString() ?? null,
  violationCount: submission.violationCount,
  answers: {
    mcq: (submission.mcqAnswers ?? []).map((answer) => ({
      itemId: answer.itemId,
      selectedOptionIds: answer.selectedOptions.map((option) => option.optionId)
    })),
    trueFalse: (submission.tfAnswers ?? []).map((answer) => ({
      itemId: answer.itemId,
      optionId: answer.optionId,
      selectedValue: answer.selectedValue
    })),
    numeric: (submission.numericAnswers ?? []).map((answer) => ({
      itemId: answer.itemId,
      answerValue: answer.answerValue.toString()
    })),
    essay: (submission.essayAnswers ?? []).map((answer) => ({
      itemId: answer.itemId,
      answer: answer.answer
    }))
  }
})

// Map một placement thành item danh sách assessment của học sinh.
export const mapStudentAssessmentListItem = (placement: StudentPlacementListItem) => {
  const latestSubmission = placement.submissions[0] ?? null
  const course = placement.course ?? placement.lesson?.chapter.course ?? null

  return {
    placementId: placement.id,
    placementType: placement.type,
    assessmentId: placement.assessmentId,
    title: placement.assessment.title,
    subject: placement.assessment.subject,
    grade: placement.assessment.grade,
    assessmentType: placement.assessment.type,
    gradingType: placement.assessment.gradingType,
    timeLimitMinutes: placement.assessment.timeLimitMinutes,
    maxAttempts: placement.maxAttempts,
    openTime: placement.openTime,
    closeTime: placement.closeTime,
    course,
    lesson: placement.lesson
      ? {
          id: placement.lesson.id,
          title: placement.lesson.title,
          chapterTitle: placement.lesson.chapter.title
        }
      : null,
    attempt: {
      usedAttempts: placement.submissions.length,
      latestSubmission: latestSubmission
        ? {
            id: latestSubmission.id,
            assessmentId: latestSubmission.assessmentId,
            placementId: latestSubmission.placementId,
            attemptNumber: latestSubmission.attemptNumber,
            status: latestSubmission.status,
            startTime: latestSubmission.startTime,
            submitTime: latestSubmission.submitTime,
            autoScore: latestSubmission.autoScore?.toString() ?? null,
            finalScore: latestSubmission.finalScore?.toString() ?? null
          }
        : null
    }
  }
}

// Map danh sách assessment của học sinh kèm phân trang.
export const mapStudentAssessmentListResponse = (
  placements: StudentPlacementListItem[],
  totalItems: number,
  page: number,
  limit: number
) => ({
  items: placements.map(mapStudentAssessmentListItem),
  pagination: {
    page,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit)
  }
})

// Map dữ liệu workspace trả về khi học sinh đang làm bài.
export const mapAssessmentWorkspace = (
  placement: RuntimePlacement,
  submissionId: string,
  submission: SubmissionDetail,
  timeRemainingSeconds: number | null
) => {
  const runtime = mapRuntimePlacement(placement)
  const { type: placementType, ...workspace } = runtime
  void placementType

  return {
    ...workspace,
    submissionId,
    submission: mapSubmissionForRuntime(submission),
    timeRemainingSeconds
  }
}
