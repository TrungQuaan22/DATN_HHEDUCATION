import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'
import { validateCourseIsPublished } from '~/modules/courses/policies/course.policy'
import { ensureCourseExistsForEnrollment, ensureUserExists } from './ensures/enrollment.ensure'
import {
  validateEnrollmentDoesNotExist,
  validateUserCanEnroll
} from './policies/enrollment.policy'
import { mapEnrollment } from './mappers/enrollment.mapper'

import type { CreateManualEnrollmentDto, ManualEnrollmentResponse } from './dto'
import { enrollmentRepository } from './repository'
import type { EnrollmentRepositoryPort } from './ports/enrollment-repository.port'

export class EnrollmentService {
  constructor(private readonly repository: EnrollmentRepositoryPort) {}

  async createManualEnrollment(
    input: CreateManualEnrollmentDto
  ): Promise<ManualEnrollmentResponse> {
    const courseRecord = await this.repository.findCourseForManualEnrollment(input.courseId)
    const course = ensureCourseExistsForEnrollment(courseRecord)
    validateCourseIsPublished(course)

    const userRecord = await this.repository.findUserForManualEnrollment(input.userId)
    ensureUserExists(userRecord)
    validateUserCanEnroll(userRecord)

    const existingEnrollment = await this.repository.findEnrollmentByUserAndCourse(input)
    validateEnrollmentDoesNotExist(existingEnrollment)

    try {
      const enrollment = await this.repository.createManualEnrollment(input)
      return mapEnrollment(enrollment)
    } catch (error) {
      if (this.repository.isUniqueConstraintError(error)) {
        throw new AppError(409, ERROR_CODE.CONFLICT, 'User is already enrolled in this course')
      }
      throw error
    }
  }
}

export const enrollmentService = new EnrollmentService(enrollmentRepository)
