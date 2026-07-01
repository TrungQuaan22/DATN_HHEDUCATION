import type {
  LessonMaterialProcessingStatus,
  LessonMaterialType,
  MediaStatus
} from '@prisma/client'

import type { AdminChapterWithCourseRecord } from './admin-chapter-repository.port'

export type LessonMaterialMediaRecord = {
  id: string
  objectKey: string
  originalName: string | null
  mimeType: string
  sizeBytes: number
  status: MediaStatus
}

export type AdminLessonMaterialRecord = {
  id: string
  courseId: string
  lessonId: string
  mediaId: string | null
  createdById: string | null
  title: string
  type: LessonMaterialType
  objectKey: string | null
  contentText: string | null
  extractedText: string | null
  processingStatus: LessonMaterialProcessingStatus
  processingError: string | null
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  media: LessonMaterialMediaRecord | null
}

export type AdminLessonMaterialWithLessonRecord = AdminLessonMaterialRecord & {
  lesson: {
    id: string
    chapter: AdminChapterWithCourseRecord
  }
}

export interface AdminLessonMaterialRepositoryPort {
  listLessonMaterials(lessonId: string): Promise<AdminLessonMaterialRecord[]>
  findMaterialById(materialId: string): Promise<AdminLessonMaterialWithLessonRecord | null>
  createLessonMaterial(data: {
    courseId: string
    lessonId: string
    mediaId?: string | null
    createdById?: string | null
    title: string
    type: LessonMaterialType
    objectKey?: string | null
    contentText?: string | null
    isPublic: boolean
  }): Promise<AdminLessonMaterialRecord>
  updateLessonMaterial(data: {
    materialId: string
    mediaId?: string | null
    title?: string
    objectKey?: string | null
    contentText?: string | null
    isPublic?: boolean
    processingStatus?: LessonMaterialProcessingStatus
    processingError?: string | null
  }): Promise<AdminLessonMaterialRecord>
  softDeleteLessonMaterial(materialId: string): Promise<AdminLessonMaterialRecord>
}
