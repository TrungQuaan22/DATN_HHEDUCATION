import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'

import type {
  LearningCourseDetailDto,
  ListLearningCoursesResponseDto
} from '../dto/learning.dto'
import { mapLearningCourseDetail, mapLearningCourseItem } from '../mappers/learning.mapper'
import { courseRepository } from '../repository'

export const learningCourseService = {
  // Lists the authenticated student's enrolled courses for the learning area.
  async listMyCourses(userId: string): Promise<ListLearningCoursesResponseDto> {
    const enrollments = await courseRepository.listEnrolledCourses(userId)

    return {
      items: enrollments.map(mapLearningCourseItem)
    }
  },

  // Loads one enrolled course with chapters, lessons, and per-student progress.
  async getLearningCourse(data: {
    userId: string
    courseSlug: string
  }): Promise<LearningCourseDetailDto> {
    const enrollment = await courseRepository.findEnrolledCourseBySlug(data)

    if (!enrollment) {
      throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
    }

    return mapLearningCourseDetail(enrollment)
  }
}
