import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { ensureMediaExists } from '~/common/ensures/media.ensure'
import { validateImageMedia } from '~/common/policies/media.policy'
import { AppError } from '~/common/error/app-error'
import { normalizeText } from '~/common/utils/search'
import { createSlugFromText } from '~/common/utils/slug'

import {
  type AdminCourseDetailResponse,
  type AdminCourseResponse,
  type AdminCourseStatsResponse,
  type CourseIdDto,
  type CreateCourseDto,
  type ListAdminCoursesDto,
  type ListAdminCoursesResponse,
  type UpdateCourseDto
} from '../dto/admin-courses.dto'
import {
  type CourseActor,
  validateCourseCanBeEdited,
  validateCourseCanManage,
  validateCoursePrice
} from '../policies/course.policy'
import { mapAdminCourseDetailResponse, mapAdminCourseResponse } from '../mappers'
import type {
  AdminCourseDetailRecord,
  AdminCourseRecord,
  AdminCourseRepositoryPort
} from '../ports/admin-course-repository.port'
import { adminCourseRepository as courseRepository } from '../repositories'
import { mediaRepository } from '~/modules/media/repository'
import type { MediaRepositoryPort } from '~/modules/media/ports/media-repository.port'

export class AdminCourseService {
  constructor(
    private readonly courseRepository: AdminCourseRepositoryPort,
    private readonly mediaRepository: MediaRepositoryPort
  ) {}

  private async createCourseSlug(title: string): Promise<string> {
    const normalizedTitle = normalizeText(title)
    const baseSlug = createSlugFromText(normalizedTitle)
    const timestampSuffix = Date.now().toString().slice(-7)
    const slug = `${baseSlug}-${timestampSuffix}`

    const existedCourse = await this.courseRepository.findActiveCourseBySlug(slug)

    if (existedCourse) {
      throw new AppError(
        409,
        ERROR_CODE.COURSE_SLUG_ALREADY_EXISTS,
        ERROR_MESSAGE.COURSE_SLUG_ALREADY_EXISTS
      )
    }

    return slug
  }

  private ensureActiveTeacher(teacher: { id: string } | null): void {
    if (!teacher) {
      throw new AppError(
        400,
        ERROR_CODE.INVALID_COURSE_TEACHER,
        ERROR_MESSAGE.INVALID_COURSE_TEACHER
      )
    }
  }

  private ensureCourseExists(course: AdminCourseRecord | null): AdminCourseRecord {
    if (!course) {
      throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
    }

    return course
  }

  private ensureCourseDetailExists(
    course: AdminCourseDetailRecord | null
  ): AdminCourseDetailRecord {
    if (!course) {
      throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
    }

    return course
  }

  async createCourse(actor: CourseActor, input: CreateCourseDto): Promise<AdminCourseResponse> {
    if (actor.role !== 'admin' && input.teacherId !== actor.id) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, ERROR_MESSAGE.FORBIDDEN)
    }

    const teacher = await this.courseRepository.findActiveTeacherById(input.teacherId)
    this.ensureActiveTeacher(teacher)
    const media = input.thumbnailMediaId
      ? await this.mediaRepository.findMediaById(input.thumbnailMediaId)
      : null
    const thumbnailMedia = input.thumbnailMediaId ? ensureMediaExists(media) : null

    if (thumbnailMedia) {
      validateImageMedia(actor, thumbnailMedia, 'Thumbnail media')
    }

    const slug = await this.createCourseSlug(input.title)
    const course = await this.courseRepository.createCourse({
      ...input,
      slug,
      thumbnailObjectKey: thumbnailMedia?.objectKey ?? null
    })

    return mapAdminCourseResponse(course)
  }

  async listCourses(
    actor: CourseActor,
    input: ListAdminCoursesDto
  ): Promise<ListAdminCoursesResponse> {
    const [items, totalItems] = await this.courseRepository.listAdminCourses({
      filters: {
        status: input.status,
        teacherId: actor.role === 'admin' ? input.teacherId : actor.id,
        isFeatured: input.isFeatured,
        search: input.search
      },
      page: input.page,
      limit: input.limit
    })

    return {
      items: items.map(mapAdminCourseResponse),
      pagination: {
        page: input.page,
        limit: input.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / input.limit)
      }
    }
  }

  async getStats(actor: CourseActor): Promise<AdminCourseStatsResponse> {
    const now = new Date()
    const revenueFrom = new Date(now.getFullYear(), now.getMonth(), 1)
    const revenueTo = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    return this.courseRepository.getAdminCourseStats({
      teacherId: actor.role === 'admin' ? undefined : actor.id,
      revenueFrom,
      revenueTo
    })
  }

  async getCourse(actor: CourseActor, input: CourseIdDto): Promise<AdminCourseDetailResponse> {
    const courseRecord = await this.courseRepository.findCourseDetailById(input.courseId)
    const course = this.ensureCourseDetailExists(courseRecord)

    validateCourseCanManage(course, actor)

    return mapAdminCourseDetailResponse(course)
  }

  async updateCourse(actor: CourseActor, input: UpdateCourseDto): Promise<AdminCourseResponse> {
    const courseRecord = await this.courseRepository.findCourseById(input.courseId)
    const course = this.ensureCourseExists(courseRecord)

    validateCourseCanManage(course, actor)
    validateCourseCanBeEdited(course)

    if (actor.role !== 'admin' && input.teacherId && input.teacherId !== actor.id) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, ERROR_MESSAGE.FORBIDDEN)
    }

    if (input.teacherId) {
      const teacher = await this.courseRepository.findActiveTeacherById(input.teacherId)
      this.ensureActiveTeacher(teacher)
    }

    const media = input.thumbnailMediaId
      ? await this.mediaRepository.findMediaById(input.thumbnailMediaId)
      : null
    const thumbnailMedia = input.thumbnailMediaId ? ensureMediaExists(media) : null

    if (thumbnailMedia) {
      validateImageMedia(actor, thumbnailMedia, 'Thumbnail media')
    }

    const nextPrice = input.price ?? course.price
    let nextSalePrice = input.salePrice !== undefined ? input.salePrice : course.salePrice

    if (nextPrice === 0) {
      input.salePrice = null
      nextSalePrice = null
    }

    validateCoursePrice(nextPrice, nextSalePrice)

    const updatedCourse = await this.courseRepository.updateCourse({
      ...input,
      thumbnailObjectKey:
        input.thumbnailMediaId === undefined ? undefined : (thumbnailMedia?.objectKey ?? null)
    })

    return mapAdminCourseResponse(updatedCourse)
  }

  async publishCourse(input: CourseIdDto): Promise<AdminCourseResponse> {
    const courseRecord = await this.courseRepository.findCourseById(input.courseId)
    const course = this.ensureCourseExists(courseRecord)

    if (course.status === 'published') {
      return mapAdminCourseResponse(course)
    }

    if (course.status !== 'draft') {
      throw new AppError(400, ERROR_CODE.INVALID_COURSE_STATUS, ERROR_MESSAGE.INVALID_COURSE_STATUS)
    }

    const updatedCourse = await this.courseRepository.updateCourseStatus(
      input.courseId,
      'published'
    )

    return mapAdminCourseResponse(updatedCourse)
  }

  async archiveCourse(input: CourseIdDto): Promise<AdminCourseResponse> {
    const courseRecord = await this.courseRepository.findCourseById(input.courseId)
    const course = this.ensureCourseExists(courseRecord)

    if (course.status === 'archived') {
      return mapAdminCourseResponse(course)
    }

    const updatedCourse = await this.courseRepository.updateCourseStatus(input.courseId, 'archived')

    return mapAdminCourseResponse(updatedCourse)
  }
}

export const adminCourseService = new AdminCourseService(courseRepository, mediaRepository)
