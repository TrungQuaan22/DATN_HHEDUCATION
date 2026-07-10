import type {
  AssessmentPlacementType,
  AssessmentType,
  AssessmentVisibility,
  GradingType,
  SubmissionStatus,
  Subject,
  UserStatus
} from '@prisma/client'

export type AssessmentResultAttemptRecord = {
  id: string
  attemptNumber: number
  status: SubmissionStatus
  startTime: Date
  submitTime: Date | null
  updatedAt: Date
  autoScore: string | null
  finalScore: string | null
  violationCount: number
}

export type AssessmentResultParticipantRecord = {
  student: {
    id: string
    fullName: string
    email: string
    avatarMediaId: string | null
    avatarObjectKey: string | null
    status: UserStatus
  }
  attempts: AssessmentResultAttemptRecord[]
}

export type AssessmentResultContextRecord = {
  id: string
  title: string
  subject: Subject
  grade: number
  type: AssessmentType
  gradingType: GradingType
  visibility: AssessmentVisibility
  timeLimitMinutes: number | null
  createdById: string | null
  maxScore: string
  placement: {
    id: string
    type: AssessmentPlacementType
    courseId: string | null
    lessonId: string | null
    openTime: Date | null
    closeTime: Date | null
    maxAttempts: number | null
    course: {
      id: string
      title: string
      teacherId: string
    } | null
    lesson: {
      id: string
      title: string
      chapter: {
        course: {
          id: string
          title: string
          teacherId: string
        }
      }
    } | null
  } | null
}

export interface AdminAssessmentResultRepositoryPort {
  // Lấy context assessment để xem kết quả.
  findResultContext(assessmentId: string): Promise<AssessmentResultContextRecord | null>
  // Liệt kê học sinh và attempt của họ.
  listParticipants(data: {
    assessmentId: string
    courseId: string | null
    search?: string
  }): Promise<AssessmentResultParticipantRecord[]>
  // Tìm một học sinh và các attempt của học sinh đó.
  findParticipant(data: {
    assessmentId: string
    courseId: string | null
    studentId: string
  }): Promise<AssessmentResultParticipantRecord | null>
}
