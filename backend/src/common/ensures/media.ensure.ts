import { MediaStatus, type Media } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

export const ensureMediaExists = (media: Media | null): Media => {
  if (!media || media.status === MediaStatus.deleted) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Media not found')
  }

  return media
}
