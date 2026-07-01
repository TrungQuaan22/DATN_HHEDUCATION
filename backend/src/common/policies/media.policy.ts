import { MediaStatus, MediaType, UserRole, type Media } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

export type MediaActor = {
  id: string
  role: UserRole
}

const validateMediaOwner = (actor: MediaActor, media: Media): void => {
  if (actor.role !== UserRole.admin && media.uploadedById !== actor.id) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only use your own uploaded media')
  }
}

export function validateImageMedia(actor: MediaActor, media: Media, label = 'Image media'): void {
  if (media.type !== MediaType.image) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, `${label} must be an image`)
  }
  if (media.status !== MediaStatus.ready) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, `${label} is not ready`)
  }
  validateMediaOwner(actor, media)
}

export function validateVideoMedia(actor: MediaActor, media: Media, label = 'Video media'): void {
  const usable =
    media.status === MediaStatus.uploaded ||
    media.status === MediaStatus.processing ||
    media.status === MediaStatus.ready

  if (media.type !== MediaType.video) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, `${label} must be a video`)
  }
  if (!usable) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, `${label} is not ready to use`)
  }
  validateMediaOwner(actor, media)
}

export function validateDocumentMedia(
  actor: MediaActor,
  media: Media,
  label = 'Document media'
): void {
  if (media.type !== MediaType.document) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, `${label} must be a document`)
  }
  if (media.status !== MediaStatus.ready) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, `${label} is not ready`)
  }
  validateMediaOwner(actor, media)
}
