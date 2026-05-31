import { CourseStatus, LessonType, UserRole, VideoType } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'

import {
  adminChapterRepository,
  adminCourseRepository,
  adminLessonRepository
} from '../repositories'

export type CourseActor = {
  id: string
  role: UserRole
}

export const ensureCourseExists = async (courseId: string) => {
  const course = await adminCourseRepository.findCourseById(courseId)

  if (!course) {
    throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
  }

  return course
}

export const ensureCourseDetailExists = async (courseId: string) => {
  const course = await adminCourseRepository.findCourseDetailById(courseId)

  if (!course) {
    throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
  }

  return course
}

export const ensureActiveTeacher = async (teacherId: string) => {
  const teacher = await adminCourseRepository.findActiveTeacherById(teacherId)

  if (!teacher) {
    throw new AppError(400, ERROR_CODE.INVALID_COURSE_TEACHER, ERROR_MESSAGE.INVALID_COURSE_TEACHER)
  }
}

export const ensureChapterExists = async (chapterId: string) => {
  const chapter = await adminChapterRepository.findChapterById(chapterId)

  if (!chapter) {
    throw new AppError(404, ERROR_CODE.CHAPTER_NOT_FOUND, ERROR_MESSAGE.CHAPTER_NOT_FOUND)
  }

  return chapter
}

export const ensureLessonExists = async (lessonId: string) => {
  const lesson = await adminLessonRepository.findLessonById(lessonId)

  if (!lesson) {
    throw new AppError(404, ERROR_CODE.LESSON_NOT_FOUND, ERROR_MESSAGE.LESSON_NOT_FOUND)
  }

  return lesson
}

export const ensureAssessmentExists = async (assessmentId: string) => {
  const assessment = await adminLessonRepository.findAssessmentById(assessmentId)

  if (!assessment) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment not found')
  }

  return assessment
}

export const ensureCourseCanBeEdited = (status: CourseStatus) => {
  if (status === CourseStatus.archived) {
    throw new AppError(400, ERROR_CODE.INVALID_COURSE_STATUS, ERROR_MESSAGE.INVALID_COURSE_STATUS)
  }
}

export const ensureCourseIsPublished = (status: CourseStatus) => {
  if (status !== CourseStatus.published) {
    throw new AppError(400, ERROR_CODE.INVALID_COURSE_STATUS, ERROR_MESSAGE.INVALID_COURSE_STATUS)
  }
}

export const ensureCourseCanBeReordered = (status: CourseStatus) => {
  if (status !== CourseStatus.draft) {
    throw new AppError(400, ERROR_CODE.INVALID_COURSE_STATUS, ERROR_MESSAGE.INVALID_COURSE_STATUS)
  }
}

export const ensureCanManageCourse = ({
  actor,
  course
}: {
  actor: CourseActor
  course: { teacherId: string; deletedAt?: Date | null }
}) => {
  if (course.deletedAt) {
    throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
  }

  if (actor.role === UserRole.admin) {
    return
  }

  if (actor.role === UserRole.teacher && course.teacherId === actor.id) {
    return
  }

  throw new AppError(403, ERROR_CODE.FORBIDDEN, ERROR_MESSAGE.FORBIDDEN)
}

export const ensureCoursePriceIsValid = (data: { price: number; salePrice: number | null }) => {
  if (data.price === 0) {
    if (data.salePrice !== null && data.salePrice !== 0) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Free course cannot have a sale price')
    }
    return
  }
  if (data.salePrice != null && data.salePrice >= data.price) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Sale price must be less than price')
  }
}

export const ensureCreateLessonPayloadIsValid = (data: {
  type: LessonType
  description?: string | null
  videoType?: VideoType | null
  videoMediaId?: string | null
  youtubeUrl?: string | null
  assessmentId?: string | null
}) => {
  if (data.type === LessonType.document) {
    if (!data.description?.trim()) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Document lesson must have description')
    }
    return
  }

  if (data.type === LessonType.quiz) {
    if (!data.assessmentId) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Quiz lesson must have assessmentId')
    }
    return
  }

  if (!data.videoType) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Video lesson must have videoType')
  }

  if (data.videoType === VideoType.system && !data.videoMediaId) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'System video lesson must have videoMediaId')
  }

  if (data.videoType === VideoType.youtube && !data.youtubeUrl) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'YouTube video lesson must have youtubeUrl')
  }
}

export const ensureExactReorderIds = (expectedIds: string[], receivedIds: string[]) => {
  const uniqueReceivedIds = [...new Set(receivedIds)]

  if (expectedIds.length !== uniqueReceivedIds.length) {
    throw new AppError(
      400,
      ERROR_CODE.INVALID_REORDER_PAYLOAD,
      ERROR_MESSAGE.INVALID_REORDER_PAYLOAD
    )
  }

  const expectedSortedIds = [...expectedIds].sort()
  const receivedSortedIds = [...uniqueReceivedIds].sort()

  for (let index = 0; index < expectedSortedIds.length; index += 1) {
    if (expectedSortedIds[index] !== receivedSortedIds[index]) {
      throw new AppError(
        400,
        ERROR_CODE.INVALID_REORDER_PAYLOAD,
        ERROR_MESSAGE.INVALID_REORDER_PAYLOAD
      )
    }
  }
}
