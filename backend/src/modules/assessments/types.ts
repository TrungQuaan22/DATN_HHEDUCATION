import type {
  Assessment,
  AssessmentItem,
  AssessmentPlacement,
  AssessmentSection,
  Media,
  Question,
  QuestionOption,
  Submission,
  SubmissionMcqAnswer,
  SubmissionMcqSelectedOption,
  SubmissionTfAnswer,
  SubmissionNumericAnswer,
  SubmissionEssayAnswer,
  SubmissionStatus,
  AssessmentVisibility,
  AssessmentPlacementType,
  UserRole,
  Prisma
} from '@prisma/client'
import type {
  QuizMcqItemDto,
  ExamMcqItemDto,
  QuizTrueFalseItemDto,
  ExamTrueFalseItemDto,
  QuizNumericItemDto,
  ExamNumericItemDto,
  QuizEssayItemDto,
  ExamEssayItemDto
} from './dto'

export type AssessmentItemUnion = Partial<
  QuizMcqItemDto &
    ExamMcqItemDto &
    QuizTrueFalseItemDto &
    ExamTrueFalseItemDto &
    QuizNumericItemDto &
    ExamNumericItemDto &
    QuizEssayItemDto &
    ExamEssayItemDto
>


export type PlacementWithAssessment = AssessmentPlacement & {
  assessment: Assessment
}

export type RuntimeItem = AssessmentItem & {
  question:
    | (Question & {
        options: QuestionOption[]
      })
    | null
}

export type RuntimeSection = AssessmentSection & {
  items: RuntimeItem[]
}

export type RuntimePreviewSection = AssessmentSection & {
  items: AssessmentItem[]
}

export type RuntimePlacement = AssessmentPlacement & {
  assessment: Assessment & {
    sourceMedia: Media | null
    sections: RuntimeSection[]
  }
}

export type RuntimePreviewPlacement = AssessmentPlacement & {
  assessment: Assessment & {
    sections: RuntimePreviewSection[]
  }
}

export type StudentPlacementListItem = AssessmentPlacement & {
  assessment: Assessment
  course: {
    id: string
    title: string
    slug: string
  } | null
  lesson: {
    id: string
    title: string
    chapter: {
      title: string
      course: {
        id: string
        title: string
        slug: string
      }
    }
  } | null
  submissions: Array<{
    id: string
    assessmentId: string
    placementId: string | null
    attemptNumber: number
    status: SubmissionStatus
    startTime: Date
    submitTime: Date | null
    autoScore: Prisma.Decimal | null
    finalScore: Prisma.Decimal | null
  }>
}

export type SubmissionWorkspaceGate = {
  id: string
  assessmentId: string
  placementId: string | null
  studentId: string
  status: SubmissionStatus
  startTime: Date
  placement: {
    id: string
    type: AssessmentPlacementType
    openTime: Date | null
    closeTime: Date | null
    assessment: {
      timeLimitMinutes: number | null
      visibility: AssessmentVisibility
      deletedAt: Date | null
    }
  } | null
} | null

export type SubmissionDetail = Submission & {
  mcqAnswers: Array<SubmissionMcqAnswer & {
    selectedOptions: SubmissionMcqSelectedOption[]
  }>
  tfAnswers: SubmissionTfAnswer[]
  numericAnswers: SubmissionNumericAnswer[]
  essayAnswers: SubmissionEssayAnswer[]
}

export type StudentSubmissionComplete = Submission & {
  mcqAnswers: Array<SubmissionMcqAnswer & {
    selectedOptions: SubmissionMcqSelectedOption[]
  }>
  tfAnswers: SubmissionTfAnswer[]
  numericAnswers: SubmissionNumericAnswer[]
  essayAnswers: SubmissionEssayAnswer[]
  assessment: Assessment & {
    sections: Array<AssessmentSection & {
      items: Array<AssessmentItem & {
        question: (Question & {
          options: QuestionOption[]
        }) | null
      }>
    }>
  }
  placement: (AssessmentPlacement & {
    course: { teacherId: string } | null
    lesson: {
      chapter: {
        course: { teacherId: string }
      }
    } | null
  }) | null
  student: {
    id: string
    fullName: string
    email: string
  }
}

export type AdminAssessmentListItem = Assessment & {
  placements: Array<AssessmentPlacement & {
    course: { teacherId: string } | null
    lesson: {
      chapter: {
        course: { teacherId: string }
      }
    } | null
  }>
  _count: {
    items: number
    sections: number
    submissions: number
  }
}

export type GradingSubmissionListItem = Submission & {
  assessment: Assessment
  placement: (AssessmentPlacement & {
    course: { teacherId: string } | null
    lesson: {
      chapter: {
        course: { teacherId: string }
      }
    } | null
  }) | null
  student: {
    id: string
    fullName: string
    email: string
  }
  essayAnswers: SubmissionEssayAnswer[]
}

export type AdminAssessmentDetail = Assessment & {
  sections: Array<AssessmentSection & {
    items: Array<AssessmentItem & {
      question: (Question & {
        options: QuestionOption[]
      }) | null
    }>
  }>
  placements: Array<AssessmentPlacement & {
    course: { teacherId: string } | null
    lesson: {
      chapter: {
        course: { teacherId: string }
      }
    } | null
  }>
  _count: {
    items: number
    sections: number
    submissions: number
  }
}

export type AssessmentForPublishDetail = Assessment & {
  sourceMedia: Media | null
  createdBy: {
    role: UserRole
  } | null
  placements: Array<AssessmentPlacement & {
    course: { teacherId: string } | null
    lesson: {
      chapter: {
        course: { teacherId: string }
      }
    } | null
  }>
  _count: {
    submissions: number
  }
  sections: Array<AssessmentSection & {
    items: Array<AssessmentItem & {
      topic: {
        id: string
        name: string
      } | null
      question: (Question & {
        options: QuestionOption[]
      }) | null
    }>
  }>
}

export type SectionItemDetail = AssessmentItem & {
  question: (Question & {
    options: QuestionOption[]
  }) | null
  section: AssessmentSection
}

export type RuntimePreviewPlacementForStudent = RuntimePreviewPlacement & {
  submissions: Array<{
    id: string
    assessmentId: string
    placementId: string | null
    attemptNumber: number
    status: SubmissionStatus
    startTime: Date
    submitTime: Date | null
    autoScore: Prisma.Decimal | null
    finalScore: Prisma.Decimal | null
  }>
}

export type SubmissionSummary = {
  id: string
  assessmentId: string
  placementId: string | null
  attemptNumber: number
  status: SubmissionStatus
  startTime: Date
  submitTime: Date | null
  autoScore: Prisma.Decimal | null
  finalScore: Prisma.Decimal | null
}
