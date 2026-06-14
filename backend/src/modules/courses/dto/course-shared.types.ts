import type { CourseStatus, LessonType, Subject } from '@prisma/client'

import type { GradeValue } from '~/common/constant/taxonomy'

// Shared response fields for course APIs.
// These are building blocks for endpoint DTOs, not endpoint DTOs by themselves.
export type CourseTeacherPublic = {
  id: string
  fullName: string
  avatarUrl: string | null
}

export type CourseSummary = {
  id: string
  title: string
  slug: string
  description: string | null
  subject: Subject
  grade: GradeValue
  teacher: CourseTeacherPublic
  thumbnailUrl: string | null
  price: number
  salePrice: number | null
  status: CourseStatus
  isFeatured: boolean
  totalLessons: number
  createdAt: Date
  updatedAt: Date
}

export type CourseLessonPublic = {
  id: string
  title: string
  type: LessonType
  youtubeUrl: string | null
  durationSec: number | null
  allowPreview: boolean
  orderIndex: number
}

export type CourseChapterPublic = {
  id: string
  title: string
  orderIndex: number
  lessons: CourseLessonPublic[]
}
