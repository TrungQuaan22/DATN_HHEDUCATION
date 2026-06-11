import type {
  SubmissionStatus
} from '@prisma/client'

import type {
  SaveAnswerDto
} from '../dto'

export interface StudentAssessmentRepositoryPort {
  listStudentAssessmentPlacements(data: {
    userId: string
    subject?: any
    grade?: number
    status?: SubmissionStatus | 'not_started'
    skip: number
    take: number
  }): Promise<[any[], number]>

  findRuntimePlacementById(placementId: string): Promise<any>

  findRuntimePreviewPlacementById(placementId: string): Promise<any>

  findSubmissionWorkspaceGate(data: {
    submissionId: string
    userId: string
    placementId: string
  }): Promise<any>

  findEnrollmentForPlacement(userId: string, placementId: string): Promise<any>

  findEnrollmentForLessonPlacement(userId: string, placementId: string): Promise<any>

  countAttempts(userId: string, placementId: string): Promise<number>

  findDoingSubmissionForPlacement(userId: string, placementId: string): Promise<any>

  createSubmission(data: {
    userId: string
    assessmentId: string
    placementId: string
    attemptNumber: number
  }): Promise<any>

  findSubmissionForStudent(submissionId: string, userId: string): Promise<any>

  saveAnswers(submissionId: string, answers: SaveAnswerDto[]): Promise<void>

  updateAutoGrading(data: {
    submissionId: string
    mcqResults: any[]
    tfResults: any[]
    numericResults: any[]
    autoScore: any
    status: SubmissionStatus
    finalScore: any | null
  }): Promise<any>
}
