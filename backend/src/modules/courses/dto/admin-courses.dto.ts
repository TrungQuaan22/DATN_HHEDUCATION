import type { CourseStatus, LessonType, MediaStatus, Subject, VideoType } from '@prisma/client'
import z from 'zod'

import type { GradeValue } from '~/common/constant/taxonomy'

import {
  createCourseBodySchema,
  listAdminCoursesQuerySchema,
  updateCourseBodySchema
} from '../validators/admin-courses.validator'

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

export type AdminCourseTeacher = {
  id: string
  fullName: string
  avatarUrl: string | null
  email: string
  avatarMediaId: string | null
}

// Response item for admin course summary APIs.
export type AdminCourseResponse = {
  id: string
  title: string
  slug: string
  description: string | null
  subject: Subject
  grade: GradeValue
  teacherId: string
  teacher: AdminCourseTeacher
  thumbnailUrl: string | null
  thumbnailMediaId: string | null
  price: number
  salePrice: number | null
  status: CourseStatus
  isFeatured: boolean
  totalLessons: number
  enrolledCount: number
  createdAt: Date
  updatedAt: Date
}

export type AdminCourseTopicResponse = {
  id: string
  name: string
  parentId: string | null
  courseId: string
}

export type AdminCourseLessonResponse = {
  id: string
  chapterId: string
  title: string
  type: LessonType
  youtubeUrl: string | null
  durationSec: number | null
  allowPreview: boolean
  orderIndex: number
  description: string | null
  videoType: VideoType | null
  videoMediaId: string | null
  assessmentId: string | null
  hasRagError: boolean
  videoMedia: {
    id: string
    url: string | null
    originalName: string | null
    status: MediaStatus
    durationSec: number | null
  } | null
  createdAt: Date
  updatedAt: Date
}

export type AdminCourseChapterResponse = {
  id: string
  courseId: string
  title: string
  orderIndex: number
  lessons: AdminCourseLessonResponse[]
  createdAt: Date
  updatedAt: Date
}

// Response DTO for GET /admin/courses/:courseId
export type AdminCourseDetailResponse = AdminCourseResponse & {
  topics: AdminCourseTopicResponse[]
  chapters: AdminCourseChapterResponse[]
}

// Response DTO for GET /admin/courses
export type ListAdminCoursesResponse = {
  items: AdminCourseResponse[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export type AdminCourseStatsResponse = {
  active: number
  draft: number
  teachers: number
  monthlyRevenue: number
}
