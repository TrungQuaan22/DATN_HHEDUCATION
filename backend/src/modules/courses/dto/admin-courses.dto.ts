import z from 'zod'

import {
  createCourseBodySchema,
  listAdminCoursesQuerySchema,
  updateCourseBodySchema
} from '../validators/admin-courses.validator'
import type {
  AdminCourseChapter,
  AdminCourseTeacher,
  CourseSummary,
  PaginatedResponseShape
} from './course-shared.types'

// Request DTO for POST /admin/courses
export type CreateCourseDto = z.infer<typeof createCourseBodySchema>

// Request DTO for GET /admin/courses
export type ListAdminCoursesDto = z.infer<typeof listAdminCoursesQuerySchema>

// Request DTO for PATCH /admin/courses/:courseId
export type UpdateCourseDto = z.infer<typeof updateCourseBodySchema> & {
  courseId: string
}

// Request DTO for admin course APIs that only need courseId.
export type CourseIdDto = {
  courseId: string
}

// Response item for admin course summary APIs.
// Admin includes internal ids, full teacher info, and enrollment count.
export type AdminCourseSummary = Omit<
  CourseSummary,
  'teacher'
> & {
  teacherId: string
  teacher: AdminCourseTeacher
  thumbnailMediaId: string | null
  enrolledCount: number
}

// Response DTO for GET /admin/courses/:courseId
export type AdminCourseDetailResponseDto = AdminCourseSummary & {
  chapters: AdminCourseChapter[]
}

// Response DTO for admin course mutations metadata: create, update, publish, archive.
// These APIs return course summary only, without chapters/lessons.
export type AdminCourseResponseDto = AdminCourseSummary

// Response DTO for GET /admin/courses
// This API returns paginated list of courses, includes unpublished and archived courses and pagination metadata. Each course item is course summary without chapters/lessons.
export type ListAdminCoursesResponseDto = PaginatedResponseShape<AdminCourseSummary>
