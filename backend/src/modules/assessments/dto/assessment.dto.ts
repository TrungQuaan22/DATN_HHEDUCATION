import type {
  AssessmentItemType,
  AssessmentPlacementType,
  AssessmentType,
  AssessmentVisibility,
  GradingType,
  QuestionDifficulty,
  SubmissionStatus,
  UserRole,
  Subject
} from '@prisma/client'

export type AssessmentActorDto = {
  id: string
  role: UserRole
}

export type ListAdminAssessmentsDto = {
  scope?: 'all' | 'public' | 'course' | 'unplaced'
  courseId?: string
  visibility?: AssessmentVisibility
  subject?: Subject
  grade?: number
  gradingType?: GradingType
  page: number
  limit: number
}

export type ListStudentAssessmentsDto = {
  subject?: Subject
  grade?: number
  status?: 'not_started' | SubmissionStatus
  page: number
  limit: number
}

export type CreateAssessmentDto = {
  title: string
  subject: Subject
  grade: number
  type: AssessmentType
  gradingType: GradingType
  timeLimitMinutes?: number | null
  sourceMediaId?: string | null
  createdById?: string | null
}

export type CreatePlacementDto = {
  assessmentId: string
  type: AssessmentPlacementType
  courseId?: string | null
  lessonId?: string | null
  openTime?: string | null
  closeTime?: string | null
  maxAttempts?: number | null
  slug?: string | null
  isFeatured?: boolean
  orderIndex?: number | null
}

export type UpsertPlacementDto = Omit<CreatePlacementDto, 'assessmentId'>

export type CloneAssessmentDto = {
  title?: string
}

export type CreateAssessmentSectionDto = {
  title: string
  description?: string | null
  itemType: AssessmentItemType
}

export type UpdateAssessmentSectionDto = {
  title?: string
  description?: string | null
}

export type AssessmentItemBaseDto = {
  topicId?: string | null
  topicName?: string | null
  explanation?: string | null
  difficulty: QuestionDifficulty
  maxScore: number
}

export type QuizMcqItemDto = AssessmentItemBaseDto & {
  contentLabel: string
  options: Array<{ content: string; isCorrect: boolean }>
  mode: 'single' | 'multiple'
}

export type ExamMcqItemDto = AssessmentItemBaseDto & {
  optionCount: number
  correctOptions: string[]
}

export type QuizTrueFalseItemDto = AssessmentItemBaseDto & {
  contentLabel: string
  statements: Array<{ label: string; correctValue: boolean }>
}

export type ExamTrueFalseItemDto = AssessmentItemBaseDto & {
  statements: Array<{ correctValue: boolean }>
}

export type QuizNumericItemDto = AssessmentItemBaseDto & {
  contentLabel: string
  correctAnswer: number
}

export type ExamNumericItemDto = AssessmentItemBaseDto & {
  correctAnswer: number
}

export type QuizEssayItemDto = AssessmentItemBaseDto & {
  contentLabel: string
  rubric?: unknown
}

export type ExamEssayItemDto = AssessmentItemBaseDto & {
  rubric?: unknown
}

export type CreateAssessmentItemDto =
  | QuizMcqItemDto
  | ExamMcqItemDto
  | QuizTrueFalseItemDto
  | ExamTrueFalseItemDto
  | QuizNumericItemDto
  | ExamNumericItemDto
  | QuizEssayItemDto
  | ExamEssayItemDto

export type CreateAssessmentItemsDto = {
  courseId?: string | null
  items: CreateAssessmentItemDto[]
}

export type UpdateAssessmentItemDto = Partial<CreateAssessmentItemDto>

export type SaveAnswerDto =
  | {
      itemId: string
      type: 'mcq'
      selectedOptionIds: string[]
    }
  | {
      itemId: string
      type: 'true_false'
      selections: Array<{ optionId: string; selectedValue: boolean }>
    }
  | {
      itemId: string
      type: 'numeric'
      answerValue: number
    }
  | {
      itemId: string
      type: 'essay'
      answer: string
    }

export type SaveAnswersDto = {
  submissionId: string
  answers: SaveAnswerDto[]
}

export type GradeEssayDto = {
  submissionId: string
  itemId: string
  teacherScore: number
  teacherNote?: string | null
}

export type AssessmentSummaryDto = {
  id: string
  title: string
  subject: Subject
  grade: number
  type: AssessmentType
  gradingType: GradingType
  visibility: string
}

export type AssessmentPlacementSummaryDto = {
  id: string
  type: AssessmentPlacementType
  slug: string | null
  isFeatured: boolean
  assessment: AssessmentSummaryDto
}

export type RuntimeAssessmentDto = AssessmentPlacementSummaryDto & {
  timeLimitMinutes: number | null
  sourceMediaId: string | null
  sourceMediaUrl: string | null
  sections: Array<{
    id: string
    itemType: AssessmentItemType
    title: string
    description: string | null
    orderIndex: number
    items: Array<{
      id: string
      questionNumber: number
      orderIndex: number
      itemType: AssessmentItemType
      maxScore: string
      answerMode: 'single' | 'multiple' | null
      question: {
        id: string
        type: string
        content: unknown
        options: Array<{
          id: string
          content: unknown
          orderIndex: number
        }>
    } | null
    }>
  }>
  submissions?: AssessmentSubmissionRuntimeDto[]
}

export type AssessmentSubmissionRuntimeDto = {
  id: string
  assessmentId: string
  placementId: string | null
  attemptNumber: number
  status: string
  startTime: Date
  submitTime: Date | null
  autoScore: string | null
  finalScore: string | null
  answers: {
    mcq: Array<{ itemId: string; selectedOptionIds: string[] }>
    trueFalse: Array<{ itemId: string; optionId: string; selectedValue: boolean }>
    numeric: Array<{ itemId: string; answerValue: string }>
    essay: Array<{ itemId: string; answer: string }>
  }
}
