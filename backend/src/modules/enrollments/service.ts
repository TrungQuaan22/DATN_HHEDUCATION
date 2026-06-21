import { UserRole, UserStatus } from '@prisma/client'

import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'
import { ensureCourseIsPublished } from '~/modules/courses/ensures/courses.ensure'
import { Enrollment } from './entities/enrollment.entity'

import type { CreateManualEnrollmentDto, ManualEnrollmentResponse } from './dto'
import { enrollmentRepository } from './repository'
import type { EnrollmentRepositoryPort } from './ports/enrollment-repository.port'

export class EnrollmentService {
  constructor(private readonly repository: EnrollmentRepositoryPort) {}

  private ensurePublishedCourseForEnrollment(course: { status: any } | null) {
    if (!course) {
      throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
    }

    ensureCourseIsPublished(course.status)
  }

  private ensureActiveStudentForEnrollment(user: { role: UserRole; status: UserStatus } | null) {
    Enrollment.validateUserForEnrollment(user)
  }

  private ensureUserIsNotEnrolledInCourse(existingEnrollment: unknown | null) {
    if (existingEnrollment) {
      throw new AppError(409, ERROR_CODE.CONFLICT, 'User is already enrolled in this course')
    }
  }

  async createManualEnrollment(
    input: CreateManualEnrollmentDto
  ): Promise<ManualEnrollmentResponse> {
    const course = await this.repository.findCourseForManualEnrollment(input.courseId)
    this.ensurePublishedCourseForEnrollment(course)

    const user = await this.repository.findUserForManualEnrollment(input.userId)
    this.ensureActiveStudentForEnrollment(user)

    const existingEnrollment = await this.repository.findEnrollmentByUserAndCourse(input)
    this.ensureUserIsNotEnrolledInCourse(existingEnrollment)

    try {
      const enrollment = await this.repository.createManualEnrollment(input)

      return {
        ...enrollment,
        source: 'manual',
        orderId: null
      }
    } catch (error) {
      if (this.repository.isUniqueConstraintError(error)) {
        throw new AppError(409, ERROR_CODE.CONFLICT, 'User is already enrolled in this course')
      }

      throw error
    }
  }
}

export const enrollmentService = new EnrollmentService(enrollmentRepository)
