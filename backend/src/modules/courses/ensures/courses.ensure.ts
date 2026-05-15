import { CourseStatus, MediaStatus, MediaType } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { mediaRepository } from '~/modules/media/repository'

import { courseRepository } from '../repository'

export const ensureCourseExists = async (courseId: string) => {
  const course = await courseRepository.findCourseById(courseId)

  if (!course) {
    throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
  }

  return course
}

export const ensureCourseDetailExists = async (courseId: string) => {
  const course = await courseRepository.findCourseDetailById(courseId)

  if (!course) {
    throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
  }

  return course
}

export const ensureActiveTeacher = async (teacherId: string) => {
  const teacher = await courseRepository.findActiveTeacherById(teacherId)

  if (!teacher) {
    throw new AppError(400, ERROR_CODE.INVALID_COURSE_TEACHER, ERROR_MESSAGE.INVALID_COURSE_TEACHER)
  }
}

export const ensureChapterExists = async (chapterId: string) => {
  const chapter = await courseRepository.findChapterById(chapterId)

  if (!chapter) {
    throw new AppError(404, ERROR_CODE.CHAPTER_NOT_FOUND, ERROR_MESSAGE.CHAPTER_NOT_FOUND)
  }

  return chapter
}

export const ensureCourseCanBeEdited = (status: CourseStatus) => {
  if (status === CourseStatus.archived) {
    throw new AppError(400, ERROR_CODE.INVALID_COURSE_STATUS, ERROR_MESSAGE.INVALID_COURSE_STATUS)
  }
}

export const ensureCoursePriceIsValid = (data: { price: number; salePrice: number | null }) => {
  if (data.salePrice != null && data.salePrice >= data.price) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Sale price must be less than price')
  }
}

export const ensureReadyImageMedia = async (mediaId: string) => {
  const media = await mediaRepository.findMediaById(mediaId)

  if (!media || media.status === MediaStatus.deleted) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Media not found')
  }

  if (media.type !== MediaType.image) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Thumbnail media must be an image')
  }

  if (media.status !== MediaStatus.ready) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Thumbnail media is not ready')
  }

  return media
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
