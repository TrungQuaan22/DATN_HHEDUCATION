import type { CourseStatus, LessonType, MediaStatus, Subject, VideoType } from '@prisma/client'

import type { GradeValue } from '~/common/constant/taxonomy'

// Shared response fields for course APIs.
// These are building blocks for endpoint DTOs, not endpoint DTOs by themselves.
export type CourseTeacherPublic = {
  id: string
  fullName: string
  avatarUrl: string | null
}

export type AdminCourseTeacher = CourseTeacherPublic & {
  email: string
  avatarMediaId: string | null
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

export type AdminCourseLesson = CourseLessonPublic & {
  chapterId: string
  description: string | null
  videoType: VideoType | null
  videoMediaId: string | null
  assessmentId: string | null
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

export type AdminCourseChapter = {
  id: string
  courseId: string
  title: string
  orderIndex: number
  createdAt: Date
  updatedAt: Date
  lessons: AdminCourseLesson[]
}

export type AdminCourseTopic = {
  id: string
  name: string
  parentId: string | null
  courseId: string
}

export type PaginationResponseFields = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export type PaginatedResponseShape<TItem> = {
  items: TItem[]
  pagination: PaginationResponseFields
}
