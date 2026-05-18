import { CourseStatus, type Prisma } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { ensureActorCanUseImageMedia } from '~/common/ensures/media.ensure'
import { createSlugFromText } from '~/common/utils/slug'
import { mapAdminCourseResponse } from '../mappers/course.mapper'

import type {
  AdminCourseDetailResponseDto,
  AdminCourseResponseDto,
  CourseIdDto,
  CreateCourseDto,
  ListAdminCoursesDto,
  ListAdminCoursesResponseDto,
  UpdateCourseDto
} from '../dto/admin-courses.dto'
import { courseRepository } from '../repository'
import {
  type CourseActor,
  ensureCanManageCourse,
  ensureActiveTeacher,
  ensureCourseCanBeEdited,
  ensureCourseDetailExists,
  ensureCourseExists,
  ensureCoursePriceIsValid
} from '../ensures/courses.ensure'
import { applySearchCondition, normalizeText } from '~/common/utils/search'

const createCourseSlug = async (title: string): Promise<string> => {
  const normalizedTitle = normalizeText(title)
  const baseSlug = createSlugFromText(normalizedTitle)
  const timestampSuffix = Date.now().toString().slice(-7)
  const slug = `${baseSlug}-${timestampSuffix}`

  const existedCourse = await courseRepository.findActiveCourseBySlug(slug)

  if (existedCourse) {
    throw new AppError(
      409,
      ERROR_CODE.COURSE_SLUG_ALREADY_EXISTS,
      ERROR_MESSAGE.COURSE_SLUG_ALREADY_EXISTS
    )
  }

  return slug
}

export const adminCourseService = {
  async createCourse(actor: CourseActor, input: CreateCourseDto): Promise<AdminCourseResponseDto> {
    if (actor.role !== 'admin' && input.teacherId !== actor.id) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, ERROR_MESSAGE.FORBIDDEN)
    }

    await ensureActiveTeacher(input.teacherId)
    const thumbnailMedia = input.thumbnailMediaId
      ? await ensureActorCanUseImageMedia({
          actor,
          mediaId: input.thumbnailMediaId,
          label: 'Thumbnail media'
        })
      : null

    const slug = await createCourseSlug(input.title)
    const course = await courseRepository.createCourse({
      ...input,
      slug,
      thumbnailObjectKey: thumbnailMedia?.objectKey ?? null
    })

    return mapAdminCourseResponse(course)
  },

  async listCourses(
    actor: CourseActor,
    input: ListAdminCoursesDto
  ): Promise<ListAdminCoursesResponseDto> {
    let where: Prisma.CourseWhereInput = {
      deletedAt: null,
      status: input.status,
      teacherId: actor.role === 'admin' ? input.teacherId : actor.id,
      isFeatured: input.isFeatured
    }
    where = applySearchCondition({
      where,
      search: input.search,
      titleField: 'title',
      slugField: 'slug'
    })

    const skip = (input.page - 1) * input.limit
    const [items, totalItems] = await courseRepository.listAdminCourses({
      where,
      skip,
      take: input.limit
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
  },

  async getCourse(actor: CourseActor, input: CourseIdDto): Promise<AdminCourseDetailResponseDto> {
    const course = await ensureCourseDetailExists(input.courseId)
    ensureCanManageCourse({ actor, course })

    return mapAdminCourseResponse(course)
  },

  async updateCourse(actor: CourseActor, input: UpdateCourseDto): Promise<AdminCourseResponseDto> {
    const course = await ensureCourseExists(input.courseId)
    ensureCanManageCourse({ actor, course })
    ensureCourseCanBeEdited(course.status)

    if (actor.role !== 'admin' && input.teacherId && input.teacherId !== actor.id) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, ERROR_MESSAGE.FORBIDDEN)
    }

    if (input.teacherId) {
      await ensureActiveTeacher(input.teacherId)
    }

    const thumbnailMedia = input.thumbnailMediaId
      ? await ensureActorCanUseImageMedia({
          actor,
          mediaId: input.thumbnailMediaId,
          label: 'Thumbnail media'
        })
      : null

    const nextPrice = input.price ?? course.price
    const nextSalePrice = input.salePrice !== undefined ? input.salePrice : course.salePrice

    ensureCoursePriceIsValid({
      price: nextPrice,
      salePrice: nextSalePrice
    })

    const updatedCourse = await courseRepository.updateCourse({
      ...input,
      thumbnailObjectKey:
        input.thumbnailMediaId === undefined ? undefined : thumbnailMedia?.objectKey ?? null
    })

    return mapAdminCourseResponse(updatedCourse)
  },

  async publishCourse(input: CourseIdDto): Promise<AdminCourseResponseDto> {
    const course = await ensureCourseExists(input.courseId)

    if (course.status === CourseStatus.published) {
      return mapAdminCourseResponse(course)
    }

    if (course.status !== CourseStatus.draft) {
      throw new AppError(400, ERROR_CODE.INVALID_COURSE_STATUS, ERROR_MESSAGE.INVALID_COURSE_STATUS)
    }

    const updatedCourse = await courseRepository.updateCourseStatus(
      input.courseId,
      CourseStatus.published
    )

    return mapAdminCourseResponse(updatedCourse)
  },

  async archiveCourse(input: CourseIdDto): Promise<AdminCourseResponseDto> {
    const course = await ensureCourseExists(input.courseId)

    if (course.status === CourseStatus.archived) {
      return mapAdminCourseResponse(course)
    }

    const updatedCourse = await courseRepository.updateCourseStatus(
      input.courseId,
      CourseStatus.archived
    )

    return mapAdminCourseResponse(updatedCourse)
  }
}
