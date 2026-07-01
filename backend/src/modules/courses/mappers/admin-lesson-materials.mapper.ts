import { mapMediaUrl } from '~/common/mappers/media.mapper'

import type { AdminLessonMaterialResponse } from '../dto'
import type { AdminLessonMaterialRecord } from '../ports/admin-lesson-material-repository.port'

export const mapAdminLessonMaterialResponse = (
  material: AdminLessonMaterialRecord
): AdminLessonMaterialResponse => ({
  id: material.id,
  courseId: material.courseId,
  lessonId: material.lessonId,
  mediaId: material.mediaId,
  title: material.title,
  type: material.type,
  contentText: material.contentText,
  extractedText: material.extractedText,
  processingStatus: material.processingStatus,
  processingError: material.processingError,
  isPublic: material.isPublic,
  media: material.media
    ? {
        id: material.media.id,
        url: mapMediaUrl(material.media.objectKey),
        originalName: material.media.originalName,
        mimeType: material.media.mimeType,
        sizeBytes: material.media.sizeBytes,
        status: material.media.status
      }
    : null,
  createdAt: material.createdAt,
  updatedAt: material.updatedAt
})
