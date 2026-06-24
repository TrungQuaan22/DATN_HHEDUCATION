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
import { mapCatalogCourseResponse } from '../mappers'

export class PublicCourseService {
  constructor(private readonly courseRepository: PublicCourseRepositoryPort) {}

  async listCatalogCourses(input: ListCatalogCoursesDto): Promise<ListCatalogCoursesResponse> {
    const [items, totalItems] = await this.courseRepository.listCatalogCourses({
      filters: {
        subjects: input.subjects,
        featured: input.featured,
        grade: input.grade,
        search: input.search
      },
      sort: input.sort,
      page: input.page,
      limit: input.limit
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
      limit: 3
    })

    return {
      ...mapCatalogCourseResponse(course),
      chapters,
      relatedCourses: relatedCourses.map(mapCatalogCourseResponse)
    }
  }
}

export const publicCourseService = new PublicCourseService(courseRepository)
