import { CourseStatus, type Prisma } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { createSlugFromText } from '~/common/utils/slug'

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
  async createCourse(input: CreateCourseDto): Promise<AdminCourseResponseDto> {
    await ensureActiveTeacher(input.teacherId)

    const slug = await createCourseSlug(input.title)
    const course = await courseRepository.createCourse({
      ...input,
      slug
    })

    return course
  },

  async listCourses(input: ListAdminCoursesDto): Promise<ListAdminCoursesResponseDto> {
    let where: Prisma.CourseWhereInput = {
      deletedAt: null,
      status: input.status,
      teacherId: input.teacherId
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
      items,
      pagination: {
        page: input.page,
        limit: input.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / input.limit)
      }
    }
  },

  async getCourse(input: CourseIdDto): Promise<AdminCourseDetailResponseDto> {
    const course = await ensureCourseDetailExists(input.courseId)
    return course
  },

  async updateCourse(input: UpdateCourseDto): Promise<AdminCourseResponseDto> {
    const course = await ensureCourseExists(input.courseId)
    ensureCourseCanBeEdited(course.status)
    if (input.teacherId) {
      await ensureActiveTeacher(input.teacherId)
    }

    const nextPrice = input.price ?? course.price
    const nextSalePrice = input.salePrice !== undefined ? input.salePrice : course.salePrice

    ensureCoursePriceIsValid({
      price: nextPrice,
      salePrice: nextSalePrice
    })

    const updatedCourse = await courseRepository.updateCourse(input)

    return updatedCourse
  },

  async publishCourse(input: CourseIdDto): Promise<AdminCourseResponseDto> {
    const course = await ensureCourseExists(input.courseId)

    if (course.status === CourseStatus.published) {
      return course
    }

    if (course.status !== CourseStatus.draft) {
      throw new AppError(400, ERROR_CODE.INVALID_COURSE_STATUS, ERROR_MESSAGE.INVALID_COURSE_STATUS)
    }

    const updatedCourse = await courseRepository.updateCourseStatus(
      input.courseId,
      CourseStatus.published
    )

    return updatedCourse
  },

  async archiveCourse(input: CourseIdDto): Promise<AdminCourseResponseDto> {
    const course = await ensureCourseExists(input.courseId)

    if (course.status === CourseStatus.archived) {
      return course
    }

    const updatedCourse = await courseRepository.updateCourseStatus(
      input.courseId,
      CourseStatus.archived
    )

    return updatedCourse
  }
}
