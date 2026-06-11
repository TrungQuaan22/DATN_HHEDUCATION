import type { CourseStatus, Prisma, Subject } from '@prisma/client'

import type { GradeValue } from '~/common/constant/taxonomy'

import type { AdminCourseDetailResponseDto, AdminCourseSummary } from '../dto'

export type AdminCourseTeacherRecord = Omit<AdminCourseSummary['teacher'], 'avatarUrl'> & {
  avatarObjectKey: string | null
}

export type AdminCourseRecord = Omit<
  AdminCourseSummary,
  'teacher' | 'thumbnailUrl' | 'enrolledCount'
> & {
  thumbnailObjectKey: string | null
  teacher: AdminCourseTeacherRecord
  _count?: {
    enrollments: number
  }
}

export type AdminCourseDetailRecord = AdminCourseRecord & {
  topics: Array<{
    id: string
    name: string
    parentId: string | null
    courseId: string
  }>
  chapters: Array<{
    id: string
    courseId: string
    title: string
    orderIndex: number
    createdAt: Date
    updatedAt: Date
    lessons: Array<{
      id: string
      chapterId: string
      title: AdminCourseDetailResponseDto['chapters'][number]['lessons'][number]['title']
      type: AdminCourseDetailResponseDto['chapters'][number]['lessons'][number]['type']
      description: string | null
      videoType: AdminCourseDetailResponseDto['chapters'][number]['lessons'][number]['videoType']
      videoMediaId: string | null
      youtubeUrl: string | null
      durationSec: number | null
      allowPreview: boolean
      orderIndex: number
      createdAt: Date
      updatedAt: Date
      videoMedia: {
        id: string
        objectKey: string
        originalName: string | null
        status: AdminCourseDetailResponseDto['chapters'][number]['lessons'][number]['videoMedia'] extends infer T
          ? T extends { status: infer S }
            ? S
            : never
          : never
        durationSec: number | null
      } | null
      assessmentPlacements: Array<{
        assessmentId: string
      }>
    }>
  }>
}

export type UnreadySystemVideoLessonRecord = {
  id: string
  title: string
  videoMediaId: string | null
  videoMedia: {
    status: string
  } | null
  chapter: {
    id: string
    title: string
  }
}

export interface AdminCourseRepositoryPort {
  findActiveCourseBySlug(slug: string): Promise<{ id: string } | null>
  findDraftOrPublishedCourseByTitle(data: {
    title: string
    excludeCourseId?: string
  }): Promise<{ id: string } | null>
  findActiveTeacherById(teacherId: string): Promise<{ id: string } | null>
  findCourseById(courseId: string): Promise<AdminCourseRecord | null>
  findCourseDetailById(courseId: string): Promise<AdminCourseDetailRecord | null>
  listAdminCourses(data: {
    where: Prisma.CourseWhereInput
    skip: number
    take: number
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
  listUnreadySystemVideoLessons(courseId: string): Promise<UnreadySystemVideoLessonRecord[]>
}
