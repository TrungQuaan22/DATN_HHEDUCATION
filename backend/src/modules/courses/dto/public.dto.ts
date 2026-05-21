import type { CourseStatus, LessonType, Subject } from '@prisma/client'
import z from 'zod'

import { listCatalogCoursesQuerySchema } from '../validators/public.validator'

export type ListCatalogCoursesDto = z.infer<typeof listCatalogCoursesQuerySchema>

export type CatalogCourseItemDto = {
  id: string
  title: string
  slug: string
  description: string | null
  subject: Subject
  grade: number
  teacher: {
    id: string
    fullName: string
    avatarUrl: string | null
  }
  thumbnailUrl: string | null
  price: number
  salePrice: number | null
  status: CourseStatus
  isFeatured: boolean
  lessonsCount: number
  createdAt: Date
  updatedAt: Date
}

export type ListCatalogCoursesResponseDto = {
  items: CatalogCourseItemDto[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export type CatalogCourseDetailDto = CatalogCourseItemDto & {
  chapters: Array<{
    id: string
    title: string
    orderIndex: number
    lessons: Array<{
      id: string
      title: string
      type: LessonType
      durationSec: number | null
      allowPreview: boolean
      orderIndex: number
    }>
  }>
  relatedCourses: CatalogCourseItemDto[]
}
