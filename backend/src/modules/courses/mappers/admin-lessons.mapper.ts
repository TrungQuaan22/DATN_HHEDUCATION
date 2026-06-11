import type { LessonType, MediaStatus, VideoType } from '@prisma/client'

import { mapMediaUrl } from '~/common/mappers/media.mapper'

import type { AdminLessonResponseDto } from '../dto'

type AdminLessonResponseFields = {
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
  assessmentPlacements: Array<{ assessmentId: string }>
  orderIndex: number
  createdAt: Date
  updatedAt: Date
}

export const mapAdminLessonResponse = (
  lesson: AdminLessonResponseFields
): AdminLessonResponseDto => ({
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
  assessmentId: lesson.assessmentPlacements[0]?.assessmentId ?? null,
  orderIndex: lesson.orderIndex,
  createdAt: lesson.createdAt,
  updatedAt: lesson.updatedAt
})
