import z from 'zod'

import { listCatalogCoursesQuerySchema } from '../validators/public.validator'
import type { CourseChapterPublic, CourseSummary } from './course-shared.types'

// Request DTO for GET /courses
export type ListCatalogCoursesDto = z.infer<typeof listCatalogCoursesQuerySchema>

// Response item for public course summary APIs.
export type CatalogCourseItemDto = CourseSummary

// Response DTO for GET /courses
export type ListCatalogCoursesResponse = {
  items: CatalogCourseItemDto[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

// Response DTO for GET /courses/:courseSlug
export type CatalogCourseDetailResponse = CatalogCourseItemDto & {
  chapters: CourseChapterPublic[]
  relatedCourses: CatalogCourseItemDto[]
}
