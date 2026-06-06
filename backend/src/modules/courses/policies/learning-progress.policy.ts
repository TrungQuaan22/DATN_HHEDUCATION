import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'
import type { LearningLessonForProgressRecord } from '../ports/learning-course-repository.port'

const VIDEO_COMPLETION_THRESHOLD = 0.9

export function ensureLessonAvailable(
  lesson: LearningLessonForProgressRecord | null
): asserts lesson is LearningLessonForProgressRecord {
  if (!lesson || lesson.chapter.course.deletedAt) {
    throw new AppError(404, ERROR_CODE.LESSON_NOT_FOUND, 'Lesson not found')
  }
}

export function ensureUserIsEnrolled<T>(
  enrollment: T | null
): asserts enrollment is T {
  if (!enrollment) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You are not enrolled in this course')
  }
}

export const getLessonDuration = (lesson: {
  durationSec: number | null
  videoMedia?: {
    durationSec: number | null
  } | null
}): number => {
  const durationSec = lesson.videoMedia?.durationSec ?? lesson.durationSec

  if (!durationSec || durationSec <= 0) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Lesson duration is not available')
  }

  return durationSec
}

export const validateProgressRange = (
  watchedSeconds: number,
  lastPositionSec: number,
  durationSec: number
) => {
  if (watchedSeconds > durationSec || lastPositionSec > durationSec) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Progress values exceed lesson duration')
  }
}

export type ExistingProgressRecord = {
  watchedSeconds: number
  isCompleted: boolean
  completedAt: Date | null
} | null

export const calculateProgressState = (data: {
  existingProgress: ExistingProgressRecord
  watchedSeconds: number
  lastPositionSec: number
  durationSec: number
  now: Date
}) => {
  const finalWatchedSeconds = Math.max(
    data.existingProgress?.watchedSeconds ?? 0,
    data.watchedSeconds,
    data.lastPositionSec
  )
  const completionPositionSec = Math.floor(data.durationSec * VIDEO_COMPLETION_THRESHOLD)
  const isNowCompleted = finalWatchedSeconds >= completionPositionSec
  const wasCompleted = data.existingProgress?.isCompleted ?? false
  const newlyCompleted = isNowCompleted && !wasCompleted

  let completedAt: Date | null = null
  if (wasCompleted) {
    completedAt = data.existingProgress?.completedAt ?? null
  } else if (isNowCompleted) {
    completedAt = data.now
  }

  return {
    finalWatchedSeconds,
    isNowCompleted: wasCompleted || isNowCompleted,
    wasCompleted,
    newlyCompleted,
    completedAt
  }
}
