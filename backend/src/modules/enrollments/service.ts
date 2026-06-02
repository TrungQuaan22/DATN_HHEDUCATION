import { Prisma, UserRole, UserStatus } from '@prisma/client'

import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'
import { ensureCourseIsPublished } from '~/modules/courses/ensures/courses.ensure'

import type { CreateManualEnrollmentDto, ManualEnrollmentResponseDto } from './dto'
import { enrollmentRepository } from './repository'
import type { EnrollmentRepositoryPort } from './ports/enrollment-repository.port'

export class EnrollmentService {
  constructor(private readonly repository: EnrollmentRepositoryPort) {}

  private async ensurePublishedCourseForEnrollment(courseId: string) {
    const course = await this.repository.findCourseForManualEnrollment(courseId)

    if (!course) {
      throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
    }

    ensureCourseIsPublished(course.status)

    return course
  }

  private async ensureActiveStudentForEnrollment(userId: string) {
    const user = await this.repository.findUserForManualEnrollment(userId)

    if (!user) {
      throw new AppError(404, ERROR_CODE.USER_NOT_FOUND, ERROR_MESSAGE.USER_NOT_FOUND)
    }

    if (user.role !== UserRole.student || user.status !== UserStatus.active) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'User must be an active student')
    }
  }

  private async ensureUserIsNotEnrolledInCourse(data: { userId: string; courseId: string }) {
    const existingEnrollment = await this.repository.findEnrollmentByUserAndCourse(data)

    if (existingEnrollment) {
      throw new AppError(409, ERROR_CODE.CONFLICT, 'User is already enrolled in this course')
    }
  }

  async createManualEnrollment(
    input: CreateManualEnrollmentDto
  ): Promise<ManualEnrollmentResponseDto> {
    await this.ensurePublishedCourseForEnrollment(input.courseId)
    await this.ensureActiveStudentForEnrollment(input.userId)
    await this.ensureUserIsNotEnrolledInCourse(input)

    try {
      const enrollment = await this.repository.createManualEnrollment(input)

      return {
        ...enrollment,
        source: 'manual',
        orderId: null
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new AppError(409, ERROR_CODE.CONFLICT, 'User is already enrolled in this course')
      }

      throw error
    }
  }
}

export const enrollmentService = new EnrollmentService(enrollmentRepository)
