import { mapMediaUrl } from '~/common/mappers/media.mapper'

import type {
  AdminCourseStudentProgressResponse,
  AdminCourseStudentResponse,
  CourseStudentAssessmentStatus
} from '../dto/admin-course-students.dto'
import type {
  AdminCourseStudentProgressRecord,
  AdminCourseStudentRecord,
  CourseStudentProgressStatus
} from '../ports/admin-course-student-repository.port'

function calculatePercentage(completed: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((completed / total) * 100))
}

function getProgressStatus(
  completed: number,
  total: number,
  hasActivity: boolean
): CourseStudentProgressStatus {
  if (total > 0 && completed >= total) return 'completed'
  if (completed > 0 || hasActivity) return 'in_progress'
  return 'not_started'
}

function mapStudent(record: AdminCourseStudentRecord['student']) {
  return {
    id: record.id,
    fullName: record.fullName,
    email: record.email,
    avatarMediaId: record.avatarMediaId,
    avatarUrl: mapMediaUrl(record.avatarObjectKey),
    status: record.status
  }
}

function getAssessmentStatus(
  attempts: AdminCourseStudentRecord['assessmentSubmissions']
): CourseStudentAssessmentStatus {
  const latest = attempts.at(-1)
  if (!latest) return 'not_started'
  if (latest.status === 'doing') return 'doing'
  if (latest.status === 'submitted') return 'pending_grading'
  return 'completed'
}

function getBestScore(attempts: AdminCourseStudentRecord['assessmentSubmissions']) {
  const scores = attempts
    .map((attempt) => attempt.finalScore)
    .filter((score): score is string => score !== null)
    .map(Number)
  return scores.length ? Math.max(...scores).toString() : null
}

function getLatestScore(attempts: AdminCourseStudentRecord['assessmentSubmissions']) {
  const latest = attempts.at(-1)
  return latest?.finalScore ?? latest?.autoScore ?? null
}

function getLatestAssessmentAttempts(attempts: AdminCourseStudentRecord['assessmentSubmissions']) {
  const latestByAssessment = new Map<
    string,
    AdminCourseStudentRecord['assessmentSubmissions'][number]
  >()
  for (const attempt of attempts) {
    const current = latestByAssessment.get(attempt.assessmentId)
    if (!current || attempt.attemptNumber > current.attemptNumber) {
      latestByAssessment.set(attempt.assessmentId, attempt)
    }
  }
  return [...latestByAssessment.values()]
}

export function mapAdminCourseStudentResponse(
  record: AdminCourseStudentRecord,
  totalLessons: number,
  totalAssessments: number
): AdminCourseStudentResponse {
  const completedLessons = record.progress?.completedLessons ?? 0
  const lastLearnedAt = record.progress?.lastLearnedAt ?? null

  const latestAttempts = getLatestAssessmentAttempts(record.assessmentSubmissions)
  const latestAssessmentAttempt = latestAttempts.reduce<
    AdminCourseStudentRecord['assessmentSubmissions'][number] | null
  >((latest, attempt) => (!latest || attempt.updatedAt > latest.updatedAt ? attempt : latest), null)
  const pendingAssessmentIds = new Set(
    latestAttempts
      .filter((attempt) => attempt.status === 'submitted')
      .map((attempt) => attempt.assessmentId)
  )
  const doingAssessmentIds = new Set(
    latestAttempts
      .filter((attempt) => attempt.status === 'doing')
      .map((attempt) => attempt.assessmentId)
  )
  const completedAssessmentIds = new Set(
    latestAttempts
      .filter((attempt) => attempt.status === 'completed' || attempt.status === 'auto_submitted')
      .map((attempt) => attempt.assessmentId)
  )
  const activityTimes = [lastLearnedAt, latestAssessmentAttempt?.updatedAt ?? null].filter(
    (value): value is Date => value !== null
  )

  return {
    student: mapStudent(record.student),
    source: record.source,
    enrolledAt: record.enrolledAt,
    completedLessons,
    totalLessons,
    progressPercentage: calculatePercentage(completedLessons, totalLessons),
    lastLearnedAt,
    progressStatus: getProgressStatus(completedLessons, totalLessons, Boolean(lastLearnedAt)),
    assessmentProgress: {
      completedAssessments: completedAssessmentIds.size,
      totalAssessments,
      notStartedAssessments: Math.max(0, totalAssessments - latestAttempts.length),
      doingAssessments: doingAssessmentIds.size,
      pendingGradingAssessments: pendingAssessmentIds.size,
      bestScore: getBestScore(record.assessmentSubmissions),
      latestScore: latestAssessmentAttempt?.finalScore ?? latestAssessmentAttempt?.autoScore ?? null
    },
    latestActivityAt: activityTimes.length
      ? new Date(Math.max(...activityTimes.map((value) => value.getTime())))
      : null
  }
}

export function mapAdminCourseStudentProgressResponse(
  record: AdminCourseStudentProgressRecord
): AdminCourseStudentProgressResponse {
  const chapters = record.course.chapters.map((chapter) => {
    const lessons = chapter.lessons.map((lesson) => {
      const progress = lesson.progress
      const assessmentSubmission = lesson.assessmentSubmission
      const quizIsCompleted = Boolean(
        assessmentSubmission && assessmentSubmission.status !== 'doing'
      )
      const quizIsInProgress = assessmentSubmission?.status === 'doing'
      const hasActivity = Boolean(
        progress && (progress.watchedSeconds > 0 || progress.lastPositionSec > 0)
      )
      const status =
        lesson.type === 'quiz'
          ? quizIsCompleted
            ? 'completed'
            : getProgressStatus(0, 1, quizIsInProgress)
          : progress?.isCompleted
            ? 'completed'
            : getProgressStatus(0, 1, hasActivity)
      const progressPercentage =
        lesson.type === 'quiz'
          ? quizIsCompleted
            ? 100
            : 0
          : progress
            ? calculatePercentage(progress.watchedSeconds, progress.durationSec)
            : 0

      return {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        orderIndex: lesson.orderIndex,
        status,
        progressPercentage,
        watchedSeconds: progress?.watchedSeconds ?? 0,
        durationSec: progress?.durationSec ?? null,
        completedAt:
          lesson.type === 'quiz'
            ? quizIsCompleted
              ? (assessmentSubmission?.submitTime ?? null)
              : null
            : (progress?.completedAt ?? null),
        lastLearnedAt:
          lesson.type === 'quiz'
            ? (assessmentSubmission?.updatedAt ?? null)
            : (progress?.updatedAt ?? null)
      }
    })

    return {
      id: chapter.id,
      title: chapter.title,
      orderIndex: chapter.orderIndex,
      completedLessons: lessons.filter((lesson) => lesson.status === 'completed').length,
      totalLessons: lessons.length,
      lessons
    }
  })
  const completedLessons = chapters.reduce((total, chapter) => total + chapter.completedLessons, 0)
  const totalLessons = chapters.reduce((total, chapter) => total + chapter.totalLessons, 0)
  const lastLearnedAt = record.courseProgress?.lastLearnedAt ?? null

  const assessments = record.assessments.map((assessment) => {
    const latest = assessment.attempts.at(-1) ?? null
    return {
      id: assessment.id,
      title: assessment.title,
      status: getAssessmentStatus(assessment.attempts),
      attemptCount: assessment.attempts.length,
      maxAttempts: assessment.maxAttempts,
      maxScore: assessment.maxScore,
      bestScore: getBestScore(assessment.attempts),
      latestScore: getLatestScore(assessment.attempts),
      latestSubmissionId: latest?.id ?? null,
      latestSubmitTime: latest?.submitTime ?? null,
      latestActivityAt: latest?.updatedAt ?? null,
      openTime: assessment.openTime,
      closeTime: assessment.closeTime
    }
  })

  return {
    student: mapStudent(record.student),
    enrollment: {
      source: record.source,
      enrolledAt: record.enrolledAt
    },
    course: {
      id: record.course.id,
      title: record.course.title,
      totalLessons
    },
    summary: {
      completedLessons,
      progressPercentage: calculatePercentage(completedLessons, totalLessons),
      lastLearnedAt,
      progressStatus: getProgressStatus(completedLessons, totalLessons, Boolean(lastLearnedAt))
    },
    chapters,
    assessments
  }
}
