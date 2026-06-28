import type { EnrollmentSource, LessonType, UserStatus } from '@prisma/client'
import z from 'zod'

import { listAdminCourseStudentsQuerySchema } from '../validators/admin-course-students.validator'
import type { CourseStudentProgressStatus } from '../ports/admin-course-student-repository.port'

export type CourseStudentAssessmentStatus =
  | 'not_started'
  | 'doing'
  | 'pending_grading'
  | 'completed'

export type ListAdminCourseStudentsDto = z.infer<typeof listAdminCourseStudentsQuerySchema> & {
  courseId: string
}

export type GetAdminCourseStudentProgressDto = {
  courseId: string
  studentId: string
}

export type AdminCourseStudentResponse = {
  student: {
    id: string
    fullName: string
    email: string
    avatarMediaId: string | null
    avatarUrl: string | null
    status: UserStatus
  }
  source: EnrollmentSource
  enrolledAt: Date
  completedLessons: number
  totalLessons: number
  progressPercentage: number
  lastLearnedAt: Date | null
  progressStatus: CourseStudentProgressStatus
  assessmentProgress: {
    completedAssessments: number
    totalAssessments: number
    notStartedAssessments: number
    doingAssessments: number
    pendingGradingAssessments: number
    bestScore: string | null
    latestScore: string | null
  }
  latestActivityAt: Date | null
}

export type ListAdminCourseStudentsResponse = {
  items: AdminCourseStudentResponse[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
  stats: {
    total: number
    notStarted: number
    inProgress: number
    completed: number
  }
}

export type AdminCourseStudentLessonProgressResponse = {
  id: string
  title: string
  type: LessonType
  orderIndex: number
  status: CourseStudentProgressStatus
  progressPercentage: number
  watchedSeconds: number
  durationSec: number | null
  completedAt: Date | null
  lastLearnedAt: Date | null
}

export type AdminCourseStudentProgressResponse = {
  student: AdminCourseStudentResponse['student']
  enrollment: {
    source: EnrollmentSource
    enrolledAt: Date
  }
  course: {
    id: string
    title: string
    totalLessons: number
  }
  summary: {
    completedLessons: number
    progressPercentage: number
    lastLearnedAt: Date | null
    progressStatus: CourseStudentProgressStatus
  }
  chapters: Array<{
    id: string
    title: string
    orderIndex: number
    completedLessons: number
    totalLessons: number
    lessons: AdminCourseStudentLessonProgressResponse[]
  }>
  assessments: Array<{
    id: string
    title: string
    status: CourseStudentAssessmentStatus
    attemptCount: number
    maxAttempts: number | null
    maxScore: string
    bestScore: string | null
    latestScore: string | null
    latestSubmissionId: string | null
    latestSubmitTime: Date | null
    latestActivityAt: Date | null
    openTime: Date | null
    closeTime: Date | null
  }>
}
