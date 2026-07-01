import type { CourseStatus, LessonType, MediaStatus, Subject, VideoType } from '@prisma/client'

import type { GradeValue } from '~/common/constant/taxonomy'

export type AdminCourseTeacherRecord = {
  id: string
  fullName: string
  email: string
  avatarObjectKey: string | null
  avatarMediaId: string | null
}

export type AdminCourseRecord = {
  id: string
  title: string
  slug: string
  description: string | null
  subject: Subject
  grade: GradeValue
  teacherId: string
  teacher: AdminCourseTeacherRecord
  thumbnailObjectKey: string | null
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

export type AdminCourseTopicRecord = {
  id: string
  name: string
  parentId: string | null
  courseId: string
}

export type AdminCourseLessonRecord = {
  id: string
  chapterId: string
  title: string
  type: LessonType
  description: string | null
  videoType: VideoType | null
  videoMediaId: string | null
  youtubeUrl: string | null
  durationSec: number | null
  allowPreview: boolean
  orderIndex: number
  videoMedia: {
    id: string
    objectKey: string
    originalName: string | null
    status: MediaStatus
    durationSec: number | null
  } | null
  assessmentId: string | null
  hasRagError: boolean
  createdAt: Date
  updatedAt: Date
}

export type AdminCourseChapterRecord = {
  id: string
  courseId: string
  title: string
  orderIndex: number
  lessons: AdminCourseLessonRecord[]
  createdAt: Date
  updatedAt: Date
}

export type AdminCourseDetailRecord = AdminCourseRecord & {
  topics: AdminCourseTopicRecord[]
  chapters: AdminCourseChapterRecord[]
}

export type ListAdminCoursesFilters = {
  status?: CourseStatus
  teacherId?: string
  isFeatured?: boolean
  search?: string
}

export interface AdminCourseRepositoryPort {
  findActiveCourseBySlug(slug: string): Promise<{ id: string } | null>
  findActiveTeacherById(teacherId: string): Promise<{ id: string } | null>
  findCourseById(courseId: string): Promise<AdminCourseRecord | null>
  findCourseDetailById(courseId: string): Promise<AdminCourseDetailRecord | null>
  listAdminCourses(data: {
    filters: ListAdminCoursesFilters
    page: number
    limit: number
  }): Promise<[AdminCourseRecord[], number]>
  createCourse(data: {
    title: string
    slug: string
    description?: string
    subject: Subject
    grade: GradeValue
    teacherId: string
    thumbnailMediaId?: string | null
    thumbnailObjectKey?: string | null
    price: number
    salePrice?: number | null
    isFeatured?: boolean
  }): Promise<AdminCourseRecord>
  updateCourse(data: {
    courseId: string
    title?: string
    description?: string | null
    subject?: Subject
    grade?: GradeValue
    teacherId?: string
    thumbnailMediaId?: string | null
    thumbnailObjectKey?: string | null
    price?: number
    salePrice?: number | null
    isFeatured?: boolean
  }): Promise<AdminCourseRecord>
  updateCourseStatus(courseId: string, status: CourseStatus): Promise<AdminCourseRecord>
}
