import type { LessonType, VideoType } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

export type LessonPayload = {
  type: LessonType
  description?: string | null
  videoType?: VideoType | null
  videoMediaId?: string | null
  youtubeUrl?: string | null
  assessmentId?: string | null
}

export function validateLessonPayload(data: LessonPayload): void {
  if (data.type === 'document' && !data.description?.trim()) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Document lesson must have description')
  }

  if (data.type === 'quiz' && !data.assessmentId) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Quiz lesson must have assessmentId')
  }

  if (data.type !== 'video') {
    return
  }

  if (!data.videoType) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Video lesson must have videoType')
  }

  if (data.videoType === 'system' && !data.videoMediaId) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'System video lesson must have videoMediaId')
  }

  if (data.videoType === 'youtube' && !data.youtubeUrl) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'YouTube video lesson must have youtubeUrl')
  }
}
