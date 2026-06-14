import type {
  SubmissionStatus,
  Subject,
  Enrollment
} from '@prisma/client'

import type {
  SaveAnswerDto
} from '../dto'
import type {
  StudentPlacementListItem,
  RuntimePlacement,
  RuntimePreviewPlacement,
  SubmissionWorkspaceGate,
  SubmissionDetail,
  StudentSubmissionComplete
} from '../types'

export interface StudentAssessmentRepositoryPort {
  listStudentAssessmentPlacements(data: {
    userId: string
    subject?: Subject
    grade?: number
    status?: SubmissionStatus | 'not_started'
    skip: number
    take: number
  }): Promise<[StudentPlacementListItem[], number]>

  findRuntimePlacementById(placementId: string): Promise<RuntimePlacement | null>

  findRuntimePreviewPlacementById(placementId: string): Promise<RuntimePreviewPlacement | null>

  findSubmissionWorkspaceGate(data: {
    submissionId: string
    userId: string
    placementId: string
  }): Promise<SubmissionWorkspaceGate | null>

  findEnrollmentForPlacement(userId: string, placementId: string): Promise<Enrollment | null>

  findEnrollmentForLessonPlacement(userId: string, placementId: string): Promise<Enrollment | null>

  countAttempts(userId: string, placementId: string): Promise<number>

  findDoingSubmissionForPlacement(userId: string, placementId: string): Promise<SubmissionDetail | null>

  createSubmission(data: {
    userId: string
    assessmentId: string
    placementId: string
    attemptNumber: number
  }): Promise<SubmissionDetail>

  findSubmissionForStudent(submissionId: string, userId: string): Promise<StudentSubmissionComplete | null>

  saveAnswers(submissionId: string, answers: SaveAnswerDto[]): Promise<void>

  updateAutoGrading(data: {
    submissionId: string
    mcqResults: Array<{ answerId: string; isCorrect: boolean; pointEarned: string }>
    tfResults: Array<{ answerId: string; isCorrect: boolean; pointEarned: string }>
    numericResults: Array<{ answerId: string; isCorrect: boolean; pointEarned: string }>
    autoScore: string
    status: SubmissionStatus
    finalScore: string | null
  }): Promise<StudentSubmissionComplete>
}
