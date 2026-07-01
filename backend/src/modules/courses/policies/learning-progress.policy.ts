import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

const VIDEO_COMPLETION_THRESHOLD = 0.9

export type ExistingProgress = {
  watchedSeconds: number
  isCompleted: boolean
  completedAt: Date | null
} | null

export function getLessonDuration(lesson: {
  durationSec: number | null
  videoMedia?: { durationSec: number | null } | null
}): number {
  const durationSec = lesson.videoMedia?.durationSec ?? lesson.durationSec

  if (!durationSec || durationSec <= 0) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Lesson duration is not available')
  }

  return durationSec
}

export function validateProgressRange(
  watchedSeconds: number,
  lastPositionSec: number,
  durationSec: number
): void {
  if (watchedSeconds > durationSec || lastPositionSec > durationSec) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Progress values exceed lesson duration')
  }
}

export function calculateProgress(data: {
  existingProgress: ExistingProgress
  watchedSeconds: number
  lastPositionSec: number
  durationSec: number
  now: Date
}) {
  const watchedSeconds = Math.max(
    data.existingProgress?.watchedSeconds ?? 0,
    data.watchedSeconds,
    data.lastPositionSec
  )
  const completionPosition = Math.floor(data.durationSec * VIDEO_COMPLETION_THRESHOLD)
  const wasCompleted = data.existingProgress?.isCompleted ?? false
  const isCompleted = wasCompleted || watchedSeconds >= completionPosition
  const newlyCompleted = isCompleted && !wasCompleted

  let completedAt: Date | null = null
  if (wasCompleted) {
    completedAt = data.existingProgress?.completedAt ?? null
  } else if (isCompleted) {
    completedAt = data.now
  }

  return {
    watchedSeconds,
    isCompleted,
    newlyCompleted,
    completedAt
  }
}
