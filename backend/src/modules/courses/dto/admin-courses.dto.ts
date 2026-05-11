import type { CourseStatus } from '@prisma/client'
import z from 'zod'

import {
  createCourseBodySchema,
  listAdminCoursesQuerySchema,
  updateCourseBodySchema
} from '../validators/admin-courses.validator'

export type CreateCourseDto = z.infer<typeof createCourseBodySchema>
export type ListAdminCoursesDto = z.infer<typeof listAdminCoursesQuerySchema>
export type UpdateCourseDto = z.infer<typeof updateCourseBodySchema> & {
  courseId: string
}

export type CourseIdDto = {
  courseId: string
}

export type AdminCourseItemDto = {
  id: string
  title: string
  slug: string
  description: string | null
  teacherId: string
  teacher: {
    id: string
    email: string
    fullName: string
  }
  thumbnailUrl: string | null
  price: number
  salePrice: number | null
  status: CourseStatus
  allowPreview: boolean
  createdAt: Date
  updatedAt: Date
}

export type AdminCourseDetailResponseDto = AdminCourseItemDto & {
  chapters: Array<{
    id: string
    courseId: string
    title: string
    orderIndex: number
    createdAt: Date
    updatedAt: Date
  }>
}

export type AdminCourseResponseDto = AdminCourseItemDto

export type ListAdminCoursesResponseDto = {
  items: AdminCourseItemDto[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}
