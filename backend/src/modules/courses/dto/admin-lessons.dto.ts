import type { LessonType, VideoType } from '@prisma/client'
import z from 'zod'

import {
  createLessonBodySchema,
  reorderLessonsBodySchema,
  updateLessonBodySchema
} from '../validators/admin-lessons.validator'

export type CreateLessonDto = z.infer<typeof createLessonBodySchema> & {
  chapterId: string
}

export type UpdateLessonDto = z.infer<typeof updateLessonBodySchema> & {
  lessonId: string
}

export type DeleteLessonDto = {
  lessonId: string
}

export type ReorderLessonsDto = z.infer<typeof reorderLessonsBodySchema> & {
  chapterId: string
}

export type AdminLessonResponseDto = {
  id: string
  chapterId: string
  title: string
  type: LessonType
  description: string | null
  videoType: VideoType | null
  videoMediaId: string | null
  videoUrl: string | null
  youtubeUrl: string | null
  durationSec: number | null
  allowPreview: boolean
  assessmentId: string | null
  orderIndex: number
  createdAt: Date
  updatedAt: Date
}

export type ReorderLessonsResponseDto = {
  chapterId: string
  items: Array<{
    id: string
    orderIndex: number
  }>
}
