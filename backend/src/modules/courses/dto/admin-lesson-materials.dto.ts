import type {
  LessonMaterialProcessingStatus,
  LessonMaterialType,
  MediaStatus
} from '@prisma/client'
import z from 'zod'

import type {
  createLessonMaterialBodySchema,
  updateLessonMaterialBodySchema
} from '../validators/admin-lesson-materials.validator'

export type CreateLessonMaterialDto = z.infer<typeof createLessonMaterialBodySchema> & {
  lessonId: string
}

export type UpdateLessonMaterialDto = z.infer<typeof updateLessonMaterialBodySchema> & {
  materialId: string
}

export type DeleteLessonMaterialDto = {
  materialId: string
}

export type IngestLessonMaterialDto = {
  materialId: string
}

export type IngestLessonMaterialResponse = {
  id: string
  processingStatus: LessonMaterialProcessingStatus
  triggered: true
}

export type LessonMaterialMediaDto = {
  id: string
  url: string | null
  originalName: string | null
  mimeType: string
  sizeBytes: number
  status: MediaStatus
}

export type AdminLessonMaterialResponse = {
  id: string
  courseId: string
  lessonId: string
  mediaId: string | null
  title: string
  type: LessonMaterialType
  contentText: string | null
  extractedText: string | null
  processingStatus: LessonMaterialProcessingStatus
  processingError: string | null
  isPublic: boolean
  media: LessonMaterialMediaDto | null
  createdAt: Date
  updatedAt: Date
}
