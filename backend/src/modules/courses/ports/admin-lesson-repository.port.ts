import type { LessonType, MediaStatus, VideoType } from '@prisma/client'

import type { ReorderLessonsResponseDto } from '../dto'
import type { AdminChapterWithCourseRecord } from './admin-chapter-repository.port'

export type AdminLessonRecord = {
  id: string
  chapterId: string
  title: string
  type: LessonType
  description: string | null
  videoType: VideoType | null
  videoMediaId: string | null
  videoMedia: {
    id: string
    objectKey: string
    originalName: string | null
    status: MediaStatus
    durationSec: number | null
  } | null
  youtubeUrl: string | null
  durationSec: number | null
  allowPreview: boolean
  lessonAssessments: Array<{ assessmentId: string }>
  orderIndex: number
  createdAt: Date
  updatedAt: Date
}

export type AdminLessonWithChapterRecord = AdminLessonRecord & {
  chapter: AdminChapterWithCourseRecord
}

export interface AdminLessonRepositoryPort {
  findLessonById(lessonId: string): Promise<AdminLessonWithChapterRecord | null>
  findAssessmentById(assessmentId: string): Promise<{ id: string } | null>
  listChapterLessonIds(chapterId: string): Promise<Array<{ id: string }>>
  createLesson(data: {
    courseId: string
    chapterId: string
    title: string
    type: LessonType
    description?: string | null
    videoType?: VideoType | null
    videoMediaId?: string | null
    youtubeUrl?: string | null
    durationSec?: number | null
    allowPreview?: boolean
    assessmentId?: string | null
  }): Promise<AdminLessonRecord>
  updateLesson(data: {
    lessonId: string
    title?: string
    description?: string | null
    allowPreview?: boolean
  }): Promise<AdminLessonRecord>
  softDeleteLesson(data: { lessonId: string; courseId: string }): Promise<unknown>
  reorderLessons(
    chapterId: string,
    lessonIds: string[]
  ): Promise<ReorderLessonsResponseDto['items']>
}
