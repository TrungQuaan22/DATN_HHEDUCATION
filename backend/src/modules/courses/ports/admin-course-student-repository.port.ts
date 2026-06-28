import type { EnrollmentSource, LessonType, SubmissionStatus, UserStatus } from '@prisma/client'

export type CourseStudentProgressStatus = 'not_started' | 'in_progress' | 'completed'

export type AdminCourseStudentRecord = {
  student: {
    id: string
    fullName: string
    email: string
    avatarMediaId: string | null
    avatarObjectKey: string | null
    status: UserStatus
  }
  source: EnrollmentSource
  enrolledAt: Date
  progress: {
    completedLessons: number
    lastLearnedAt: Date | null
  } | null
  assessmentSubmissions: CourseStudentAssessmentAttemptRecord[]
}

export type CourseStudentAssessmentAttemptRecord = {
  id: string
  assessmentId: string
  attemptNumber: number
  status: SubmissionStatus
  submitTime: Date | null
  updatedAt: Date
  autoScore: string | null
  finalScore: string | null
}

export type CourseStudentAssessmentRecord = {
  id: string
  title: string
  maxScore: string
  maxAttempts: number | null
  openTime: Date | null
  closeTime: Date | null
  attempts: CourseStudentAssessmentAttemptRecord[]
}

export type AdminCourseStudentProgressRecord = {
  student: AdminCourseStudentRecord['student']
  source: EnrollmentSource
  enrolledAt: Date
  course: {
    id: string
    title: string
    totalLessons: number
    chapters: Array<{
      id: string
      title: string
      orderIndex: number
      lessons: Array<{
        id: string
        title: string
        type: LessonType
        orderIndex: number
        progress: {
          watchedSeconds: number
          lastPositionSec: number
          durationSec: number
          isCompleted: boolean
          completedAt: Date | null
          updatedAt: Date
        } | null
        assessmentSubmission: {
          status: SubmissionStatus
          submitTime: Date | null
          updatedAt: Date
        } | null
      }>
    }>
  }
  courseProgress: {
    completedLessons: number
    lastLearnedAt: Date | null
  } | null
  assessments: CourseStudentAssessmentRecord[]
}

export type ListCourseStudentsFilters = {
  search?: string
  progressStatus?: CourseStudentProgressStatus
}

export type CourseStudentProgressCounts = {
  total: number
  notStarted: number
  inProgress: number
  completed: number
}

export interface AdminCourseStudentRepositoryPort {
  listCourseStudents(data: {
    courseId: string
    totalLessons: number
    filters: ListCourseStudentsFilters
    page: number
    limit: number
  }): Promise<{
    items: AdminCourseStudentRecord[]
    totalItems: number
    counts: CourseStudentProgressCounts
    totalAssessments: number
  }>
  findStudentProgress(
    courseId: string,
    studentId: string
  ): Promise<AdminCourseStudentProgressRecord | null>
}
