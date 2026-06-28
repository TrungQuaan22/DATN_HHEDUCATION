import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'

import type {
  AdminCourseStudentProgressResponse,
  GetAdminCourseStudentProgressDto,
  ListAdminCourseStudentsDto,
  ListAdminCourseStudentsResponse
} from '../dto/admin-course-students.dto'
import {
  mapAdminCourseStudentProgressResponse,
  mapAdminCourseStudentResponse
} from '../mappers/course-student.mapper'
import type { AdminCourseRepositoryPort } from '../ports/admin-course-repository.port'
import type { AdminCourseStudentRepositoryPort } from '../ports/admin-course-student-repository.port'
import type { CourseActor } from '../policies/course.policy'
import { validateCourseCanManage } from '../policies/course.policy'
import { adminCourseRepository, adminCourseStudentRepository } from '../repositories'

export class AdminCourseStudentService {
  constructor(
    private readonly courseRepository: AdminCourseRepositoryPort,
    private readonly studentRepository: AdminCourseStudentRepositoryPort
  ) {}

  private async findManagedCourse(actor: CourseActor, courseId: string) {
    const course = await this.courseRepository.findCourseById(courseId)

    if (!course) {
      throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
    }

    validateCourseCanManage(course, actor)
    return course
  }

  async listCourseStudents(
    actor: CourseActor,
    input: ListAdminCourseStudentsDto
  ): Promise<ListAdminCourseStudentsResponse> {
    const course = await this.findManagedCourse(actor, input.courseId)
    const result = await this.studentRepository.listCourseStudents({
      courseId: course.id,
      totalLessons: course.totalLessons,
      filters: {
        search: input.search,
        progressStatus: input.progressStatus
      },
      page: input.page,
      limit: input.limit
    })

    return {
      items: result.items.map((item) =>
        mapAdminCourseStudentResponse(item, course.totalLessons, result.totalAssessments)
      ),
      pagination: {
        page: input.page,
        limit: input.limit,
        totalItems: result.totalItems,
        totalPages: Math.ceil(result.totalItems / input.limit)
      },
      stats: result.counts
    }
  }

  async getStudentProgress(
    actor: CourseActor,
    input: GetAdminCourseStudentProgressDto
  ): Promise<AdminCourseStudentProgressResponse> {
    await this.findManagedCourse(actor, input.courseId)
    const progress = await this.studentRepository.findStudentProgress(
      input.courseId,
      input.studentId
    )

    if (!progress) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Student is not enrolled in this course')
    }

    return mapAdminCourseStudentProgressResponse(progress)
  }
}

export const adminCourseStudentService = new AdminCourseStudentService(
  adminCourseRepository,
  adminCourseStudentRepository
)
