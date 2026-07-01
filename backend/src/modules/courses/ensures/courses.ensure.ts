import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'
import type { LearningLessonForProgressRecord } from '../ports/learning-course-repository.port'

export function ensureLessonExists(
  lesson: LearningLessonForProgressRecord | null
): asserts lesson is LearningLessonForProgressRecord {
  if (!lesson) {
    throw new AppError(404, ERROR_CODE.LESSON_NOT_FOUND, 'Lesson not found')
  }
}

export function ensureEnrollmentExists<T>(enrollment: T | null): asserts enrollment is T {
  if (!enrollment) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You are not enrolled in this course')
  }
}
