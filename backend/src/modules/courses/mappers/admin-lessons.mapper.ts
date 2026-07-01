import { mapMediaUrl } from '~/common/mappers/media.mapper'

import type { AdminLessonResponse } from '../dto/admin-lessons.dto'
import type { AdminLessonRecord } from '../ports/admin-lesson-repository.port'

export const mapAdminLessonResponse = (
  lesson: AdminLessonRecord
): AdminLessonResponse => ({
  id: lesson.id,
  chapterId: lesson.chapterId,
  title: lesson.title,
  type: lesson.type,
  description: lesson.description,
  videoType: lesson.videoType,
  videoMediaId: lesson.videoMediaId,
  videoMedia: lesson.videoMedia
    ? {
        id: lesson.videoMedia.id,
        url: mapMediaUrl(lesson.videoMedia.objectKey),
        originalName: lesson.videoMedia.originalName,
        status: lesson.videoMedia.status,
        durationSec: lesson.videoMedia.durationSec
      }
    : null,
  youtubeUrl: lesson.youtubeUrl,
  durationSec: lesson.durationSec,
  allowPreview: lesson.allowPreview,
  assessmentId: lesson.assessmentId,
  orderIndex: lesson.orderIndex,
  createdAt: lesson.createdAt,
  updatedAt: lesson.updatedAt
})
