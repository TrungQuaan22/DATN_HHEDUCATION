import z from 'zod'

import { listCatalogCoursesQuerySchema } from '../validators/public.validator'
import type {
  CourseChapterPublic,
  CourseSummary,
  PaginatedResponseShape
} from './course-shared.types'

// Request DTO for GET /courses
export type ListCatalogCoursesDto = z.infer<typeof listCatalogCoursesQuerySchema>

// Response item for public course summary APIs.
export type CatalogCourseItemDto = CourseSummary

// Response DTO for GET /courses
export type ListCatalogCoursesResponseDto = PaginatedResponseShape<CatalogCourseItemDto>

// Response DTO for GET /courses/:courseSlug
export type CatalogCourseDetailDto = CatalogCourseItemDto & {
  chapters: CourseChapterPublic[]
  relatedCourses: CatalogCourseItemDto[]
}
