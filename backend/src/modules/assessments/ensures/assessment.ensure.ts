import {
  AssessmentItemType,
  AssessmentPlacementType,
  AssessmentVisibility,
  LessonType,
  Subject,
  UserRole
} from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

import type { CreatePlacementDto } from '../dto'
import { adminAssessmentRepository, studentAssessmentRepository } from '../repositories'

export const ensureAssessmentExists = async (assessmentId: string) => {
  const assessment = await adminAssessmentRepository.findAssessmentById(assessmentId)

  if (!assessment) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment not found')
  }

  return assessment
}

export const ensureAssessmentForPublishExists = async (assessmentId: string) => {
  const assessment = await adminAssessmentRepository.findAssessmentForPublish(assessmentId)

  if (!assessment) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment not found')
  }

  return assessment
}

export const ensureSectionExists = (
  assessment: any,
  sectionId: string
) => {
  const section = assessment.sections.find((s: any) => s.id === sectionId)

  if (!section) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Section not found')
  }

  return section
}

export const ensureSectionBelongsToAssessment = (
  assessment: any,
  sectionId: string
) => {
  const section = assessment.sections.find((s: any) => s.id === sectionId)

  if (!section) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Section does not belong to this assessment')
  }

  return section
}

export const ensureItemExists = (
  assessment: any,
  itemId: string
) => {
  const items = assessment.sections.flatMap((section: any) => section.items)
  const item = items.find((i: any) => i.id === itemId)

  if (!item) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment item not found')
  }

  return item
}

export const ensureSubmissionForGradingExists = async (submissionId: string) => {
  const submission = await adminAssessmentRepository.findSubmissionForGrading(submissionId)

  if (!submission) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Submission not found')
  }

  return submission
}

export const ensureSubmissionForStudentExists = async (submissionId: string, userId: string) => {
  const submission = await studentAssessmentRepository.findSubmissionForStudent(submissionId, userId)

  if (!submission) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Submission not found')
  }

  return submission
}

export const ensureTeacherOwnsCourse = async (
  actor: { id: string; role: UserRole },
  courseId: string
) => {
  if (actor.role === UserRole.admin) {
    return
  }

  const course = await adminAssessmentRepository.findCourseForPlacement(courseId)

  if (!course || course.teacherId !== actor.id) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only use courses you manage')
  }
}

export const ensureItemsCanUseCourseTopics = async (
  assessment: {
    subject: Subject
    grade: number
  },
  items: Array<{ topicId?: string | null; topicName?: string | null }>,
  courseId: string
) => {
  const course = await adminAssessmentRepository.findCourseForPlacement(courseId)

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

  const courseTopics = await adminAssessmentRepository.listTopicsByCourse(courseId)
  const courseTopicIds = new Set(courseTopics.map((topic) => topic.id))

  if (topicIds.some((topicId) => !courseTopicIds.has(topicId))) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Topic must belong to assessment course')
  }
}

export const ensurePlacementTargetIsValid = async (
  actor: { id: string; role: UserRole },
  assessment: {
    subject: Subject
    grade: number
  },
  data: CreatePlacementDto
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

    const course = await adminAssessmentRepository.findCourseForPlacement(data.courseId)

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

  const lesson = await adminAssessmentRepository.findLessonForPlacement(data.lessonId)

  if (!lesson) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Lesson not found')
  }

  if (lesson.type !== LessonType.quiz) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Lesson placement requires a quiz lesson')
  }

  const course = lesson.chapter.course

  if (actor.role === UserRole.teacher && course.teacherId !== actor.id) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only assign assessments to your lessons')
  }

  if (course.subject !== assessment.subject || course.grade !== assessment.grade) {
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

export const ensurePlacementAccess = async (
  userId: string | undefined,
  placement: {
    id: string
    type: AssessmentPlacementType
    openTime: Date | null
    closeTime: Date | null
  }
) => {
  ensurePlacementAvailable(placement)

  if (!userId) {
    throw new AppError(401, ERROR_CODE.UNAUTHORIZED, 'Authentication required')
  }

  if (placement.type === AssessmentPlacementType.public_practice) {
    return
  }

  const enrollment =
    placement.type === AssessmentPlacementType.course
      ? await studentAssessmentRepository.findEnrollmentForPlacement(userId, placement.id)
      : await studentAssessmentRepository.findEnrollmentForLessonPlacement(userId, placement.id)

  if (!enrollment) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'Assessment requires course enrollment')
  }
}

export const ensureSubmissionAccess = async (
  userId: string,
  submission: {
    placement: {
      id: string
      type: AssessmentPlacementType
      openTime: Date | null
      closeTime: Date | null
    } | null
  }
) => {
  if (!submission.placement) {
    return
  }

  await ensurePlacementAccess(userId, submission.placement)
}
