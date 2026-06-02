import { UserRole, UserStatus } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { ensureCourseIsPublished } from '~/modules/courses/ensures/courses.ensure'

import { enrollmentRepository } from '../repository'

export const ensurePublishedCourseForEnrollment = async (courseId: string) => {
  const course = await enrollmentRepository.findCourseForManualEnrollment(courseId)

  if (!course) {
    throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
  }

  ensureCourseIsPublished(course.status)

  return course
}

export const ensureActiveStudentForEnrollment = async (userId: string) => {
  const user = await enrollmentRepository.findUserForManualEnrollment(userId)

  if (!user) {
    throw new AppError(404, ERROR_CODE.USER_NOT_FOUND, ERROR_MESSAGE.USER_NOT_FOUND)
  }

  if (user.role !== UserRole.student || user.status !== UserStatus.active) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'User must be an active student')
  }
}

export const ensureUserIsNotEnrolledInCourse = async (data: {
  userId: string
  courseId: string
}) => {
  const existingEnrollment = await enrollmentRepository.findEnrollmentByUserAndCourse(data)

  if (existingEnrollment) {
    throw new AppError(409, ERROR_CODE.CONFLICT, 'User is already enrolled in this course')
  }
}
