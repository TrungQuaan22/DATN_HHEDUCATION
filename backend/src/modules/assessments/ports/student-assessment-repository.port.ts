import type { SubmissionStatus, Subject, Enrollment } from '@prisma/client'

import type { SaveAnswerDto } from '../dto'
import type {
  StudentPlacementListItem,
  RuntimePlacement,
  RuntimePreviewPlacement,
  SubmissionWorkspaceGate,
  SubmissionDetail,
  StudentSubmissionComplete
} from '../types'

export interface StudentAssessmentRepositoryPort {
  // Liệt kê assessment placement của học sinh.
  listStudentAssessmentPlacements(data: {
    userId: string
    subject?: Subject
    grade?: number
    status?: SubmissionStatus | 'not_started'
    page: number
    limit: number
  }): Promise<[StudentPlacementListItem[], number]>

  // Lấy runtime workspace đầy đủ theo placement.
  findRuntimePlacementById(placementId: string): Promise<RuntimePlacement | null>

  // Lấy preview placement trước khi làm bài.
  findRuntimePreviewPlacementById(placementId: string): Promise<RuntimePreviewPlacement | null>

  // Kiểm tra submission đang làm hợp lệ cho workspace.
  findSubmissionWorkspaceGate(data: {
    submissionId: string
    userId: string
    placementId: string
  }): Promise<SubmissionWorkspaceGate | null>

  // Tìm enrollment cho placement gắn course.
  findEnrollmentForPlacement(userId: string, placementId: string): Promise<Enrollment | null>

  // Tìm enrollment cho placement gắn lesson.
  findEnrollmentForLessonPlacement(userId: string, placementId: string): Promise<Enrollment | null>

  // Đếm số attempt đã dùng.
  countAttempts(userId: string, placementId: string): Promise<number>

  // Tìm submission đang doing để resume.
  findDoingSubmissionForPlacement(
    userId: string,
    placementId: string
  ): Promise<SubmissionDetail | null>

  // Tạo submission mới cho attempt.
  createSubmission(data: {
    userId: string
    assessmentId: string
    placementId: string
    attemptNumber: number
  }): Promise<SubmissionDetail>

  // Tìm submission đầy đủ của học sinh.
  findSubmissionForStudent(
    submissionId: string,
    userId: string
  ): Promise<StudentSubmissionComplete | null>

  // Liệt kê submission quá hạn để worker auto-submit.
  listExpiredDoingSubmissions(data: {
    now: Date
    limit: number
  }): Promise<StudentSubmissionComplete[]>

  // Lưu câu trả lời của submission.
  saveAnswers(submissionId: string, answers: SaveAnswerDto[]): Promise<void>

  // Ghi nhận một lần vi phạm.
  recordViolation(submissionId: string): Promise<StudentSubmissionComplete | null>

  // Chốt submission và lưu kết quả chấm.
  finalizeSubmission(data: {
    submissionId: string
    mcqResults: Array<{ answerId: string; isCorrect: boolean; pointEarned: string }>
    tfResults: Array<{ answerId: string; isCorrect: boolean; pointEarned: string }>
    numericResults: Array<{ answerId: string; isCorrect: boolean; pointEarned: string }>
    autoScore: string
    status: SubmissionStatus
    finalScore: string | null
    essayItemIds: string[]
  }): Promise<{
    submission: StudentSubmissionComplete
    didFinalize: boolean
  }>
}
