import { CourseStatus, type Prisma } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'

import type {
  CatalogCourseDetailResponse,
  ListCatalogCoursesDto,
  ListCatalogCoursesResponse
} from '../dto'
import { publicCourseRepository as courseRepository } from '../repositories'
import type { PublicCourseRepositoryPort } from '../ports/public-course-repository.port'
import { applySearchCondition } from '~/common/utils/search'
import { mapCatalogCourseResponse } from '../mappers'

const buildCatalogCourseOrderBy = (
  sort: ListCatalogCoursesDto['sort']
): Prisma.CourseOrderByWithRelationInput[] => {
  switch (sort) {
    case 'hotest':
      return [{ isFeatured: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }]
    case 'priceAsc':
      return [{ salePrice: 'asc' }, { price: 'asc' }, { createdAt: 'desc' }, { id: 'desc' }]
    case 'priceDesc':
      return [{ salePrice: 'desc' }, { price: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }]
    case 'newest':
    default:
      return [{ createdAt: 'desc' }, { id: 'desc' }]
  }
}

export class PublicCourseService {
  constructor(private readonly courseRepository: PublicCourseRepositoryPort) {}

  async listCatalogCourses(input: ListCatalogCoursesDto): Promise<ListCatalogCoursesResponse> {
    let where: Prisma.CourseWhereInput = {
      status: CourseStatus.published,
      deletedAt: null,
      subject: input.subjects
        ? {
            in: input.subjects
          }
        : undefined,
      isFeatured: input.featured,
      grade: input.grade
    }

    where = applySearchCondition({
      where,
      search: input.search,
      field: 'title',
      tokenField: 'slug'
    })

    const skip = (input.page - 1) * input.limit
    const [items, totalItems] = await this.courseRepository.listCatalogCourses({
      where,
      skip,
      take: input.limit,
      orderBy: buildCatalogCourseOrderBy(input.sort)
    })

    return {
      items: items.map(mapCatalogCourseResponse),
      pagination: {
        page: input.page,
        limit: input.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / input.limit)
      }
    }
  }

  async getCatalogCourse(courseSlug: string): Promise<CatalogCourseDetailResponse> {
    const course = await this.courseRepository.findPublishedCourseBySlug(courseSlug)

    if (!course) {
      throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
    }

    const chapters = course.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      orderIndex: chapter.orderIndex,
      lessons: chapter.lessons
    }))
    const relatedCourses = await this.courseRepository.listRelatedCatalogCourses({
      courseId: course.id,
      grade: course.grade,
      take: 3
    })

    return {
      ...mapCatalogCourseResponse(course),
      chapters,
      relatedCourses: relatedCourses.map(mapCatalogCourseResponse)
    }
  }
}

export const publicCourseService = new PublicCourseService(courseRepository)
