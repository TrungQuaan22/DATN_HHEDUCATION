import { CourseStatus, type Prisma } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { buildMediaPublicUrl } from '~/common/utils/media'

import type {
  CatalogCourseDetailDto,
  ListCatalogCoursesDto,
  ListCatalogCoursesResponseDto
} from '../dto/public.dto'
import { courseRepository } from '../repository'
import { applySearchCondition } from '~/common/utils/search'

export const publicCourseService = {
  async listCatalogCourses(input: ListCatalogCoursesDto): Promise<ListCatalogCoursesResponseDto> {
    let where: Prisma.CourseWhereInput = {
      status: CourseStatus.published,
      deletedAt: null
    }

    where = applySearchCondition({
          where,
          search: input.search,
          titleField: 'title',
          slugField: 'slug'
        })
    

    const skip = (input.page - 1) * input.limit
    const [items, totalItems] = await courseRepository.listCatalogCourses({
      where,
      skip,
      take: input.limit
    })

    return {
      items: items.map((item) => ({
        ...item,
        thumbnailUrl: buildMediaPublicUrl(item.thumbnailMedia?.objectKey)
      })),
      pagination: {
        page: input.page,
        limit: input.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / input.limit)
      }
    }
  },

  async getCatalogCourse(courseSlug: string): Promise<CatalogCourseDetailDto> {
    const course = await courseRepository.findPublishedCourseBySlug(courseSlug)

    if (!course) {
      throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
    }

    return {
      ...course,
      thumbnailUrl: buildMediaPublicUrl(course.thumbnailMedia?.objectKey),
      chapters: course.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        orderIndex: chapter.orderIndex,
        lessons: chapter.lessons
      }))
    }
  }
}
