import { AssessmentPlacementType, LessonType, Subject, UserRole } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

import type { CreatePlacementDto } from '../dto'

export const ensureAssessmentExists = <TAssessment>(
  assessment: TAssessment | null
): TAssessment => {
  if (!assessment) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment not found')
  }

  return assessment
}

export const ensureAssessmentForPublishExists = <TAssessment>(
  assessment: TAssessment | null
): TAssessment => {
  if (!assessment) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment not found')
  }

  return assessment
}

export const ensureSectionExists = <
  TSection extends { id: string }
>(
  assessment: { sections: TSection[] },
  sectionId: string
) => {
  const section = assessment.sections.find((s) => s.id === sectionId)

  if (!section) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Section not found')
  }

  return section
}

export const ensureSectionBelongsToAssessment = <
  TSection extends { id: string }
>(
  assessment: { sections: TSection[] },
  sectionId: string
) => {
  const section = assessment.sections.find((s) => s.id === sectionId)

  if (!section) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Section does not belong to this assessment')
  }

  return section
}

export const ensureItemExists = <
  TItem extends { id: string }
>(
  assessment: { sections: Array<{ items: TItem[] }> },
  itemId: string
): TItem => {
  const items = assessment.sections.flatMap((section) => section.items)
  const item = items.find((i) => i.id === itemId)

  if (!item) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment item not found')
  }

  return item
}

export const ensureSubmissionForGradingExists = <TSubmission>(
  submission: TSubmission | null
): TSubmission => {
  if (!submission) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Submission not found')
  }

  return submission
}

export const ensureSubmissionForStudentExists = <TSubmission>(
  submission: TSubmission | null
): TSubmission => {
  if (!submission) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Submission not found')
  }

  return submission
}

export const ensureTeacherOwnsCourse = (
  actor: { id: string; role: UserRole },
  course: { teacherId: string } | null
) => {
  if (actor.role === UserRole.admin) {
    return
  }

  if (!course || course.teacherId !== actor.id) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only use courses you manage')
  }
}

export const ensureItemsCanUseCourseTopics = (
  assessment: {
    subject: Subject
    grade: number
  },
  items: Array<{ topicId?: string | null; topicName?: string | null }>,
  course: { subject: Subject; grade: number } | null,
  courseTopics: Array<{ id: string }>
) => {
  if (!course) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Course not found')
  }

  if (course.subject !== assessment.subject || course.grade !== assessment.grade) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Assessment subject/grade must match course')
  }

  const hasTopicInput = (item: { topicId?: string | null; topicName?: string | null }) =>
    Boolean(item.topicId || item.topicName?.trim())

  if (items.some((item) => !hasTopicInput(item))) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Course assessments require topic for every item')
  }

  const topicIds = items
    .map((item) => item.topicId)
    .filter((topicId): topicId is string => Boolean(topicId))

  if (topicIds.length === 0) {
    return
  }

  const courseTopicIds = new Set(courseTopics.map((topic) => topic.id))

  if (topicIds.some((topicId) => !courseTopicIds.has(topicId))) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Topic must belong to assessment course')
  }
}

export const ensurePlacementTargetIsValid = (
  actor: { id: string; role: UserRole },
  assessment: {
    subject: Subject
    grade: number
  },
  data: CreatePlacementDto,
  course: { teacherId: string; subject: Subject; grade: number } | null,
  lesson: {
    type: string
    chapter: {
      course: { teacherId: string; subject: Subject; grade: number }
    }
  } | null
) => {
  if (data.openTime && data.closeTime && new Date(data.openTime) >= new Date(data.closeTime)) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'openTime must be earlier than closeTime')
  }

  if (data.type === AssessmentPlacementType.public_practice) {
    if (actor.role === UserRole.teacher) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'Teachers cannot publish assessments to public practice')
    }

    if (data.courseId || data.lessonId) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Public practice placement cannot bind course or lesson')
    }

    if (!data.slug) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Public practice placement requires slug')
    }

    return
  }

  if (data.type === AssessmentPlacementType.course) {
    if (!data.courseId) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Course placement requires courseId')
    }

    if (data.lessonId) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Course placement cannot bind lessonId')
    }

    if (!course) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Course not found')
    }

    if (actor.role === UserRole.teacher && course.teacherId !== actor.id) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only assign assessments to your courses')
    }

    if (course.subject !== assessment.subject || course.grade !== assessment.grade) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Assessment subject/grade must match course')
    }

    return
  }

  if (!data.lessonId) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Lesson placement requires lessonId')
  }

  if (data.courseId) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Lesson placement derives course access from lesson')
  }

  if (!lesson) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Lesson not found')
  }

  if (lesson.type !== LessonType.quiz) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Lesson placement requires a quiz lesson')
  }

  const lessonCourse = lesson.chapter.course

  if (actor.role === UserRole.teacher && lessonCourse.teacherId !== actor.id) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only assign assessments to your lessons')
  }

  if (lessonCourse.subject !== assessment.subject || lessonCourse.grade !== assessment.grade) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Assessment subject/grade must match lesson course')
  }
}

export const ensurePlacementAvailable = (placement: {
  openTime: Date | null
  closeTime: Date | null
}) => {
  const now = new Date()

  if (placement.openTime && placement.openTime > now) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'Assessment is not open yet')
  }

  if (placement.closeTime && placement.closeTime < now) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'Assessment is closed')
  }
}

export const ensurePlacementAccess = (
  userId: string | undefined,
  placement: {
    id: string
    type: AssessmentPlacementType
    openTime: Date | null
    closeTime: Date | null
  },
  enrollment: unknown | null
) => {
  ensurePlacementAvailable(placement)

  if (!userId) {
    throw new AppError(401, ERROR_CODE.UNAUTHORIZED, 'Authentication required')
  }

  if (placement.type === AssessmentPlacementType.public_practice) {
    return
  }

  if (!enrollment) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'Assessment requires course enrollment')
  }
}

export const ensureSubmissionAccess = (
  userId: string,
  submission: {
    placement: {
      id: string
      type: AssessmentPlacementType
      openTime: Date | null
      closeTime: Date | null
    } | null
  },
  enrollment: unknown | null
) => {
  if (!submission.placement) {
    return
  }

  ensurePlacementAccess(userId, submission.placement, enrollment)
}
