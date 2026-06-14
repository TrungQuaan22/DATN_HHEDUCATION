import { MediaStatus, MediaType, UserRole, type Media } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

export type MediaActor = {
  id: string
  role: UserRole
}

export const ensureMediaExists = (media: Media | null): Media => {
  if (!media || media.status === MediaStatus.deleted) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Media not found')
  }

  return media
}

export const ensureActorCanUseMedia = ({ actor, media }: { actor: MediaActor; media: Media }) => {
  // Non-admin users may only attach media they uploaded themselves.
  if (actor.role !== UserRole.admin && media.uploadedById !== actor.id) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only use your own uploaded media')
  }
}

export const ensureActorCanUseImageMedia = ({
  actor,
  media,
  label = 'Image media'
}: {
  actor: MediaActor
  media: Media | null
  label?: string
}): Media => {
  const verifiedMedia = ensureMediaExists(media)

  if (verifiedMedia.type !== MediaType.image) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, `${label} must be an image`)
  }

  if (verifiedMedia.status !== MediaStatus.ready) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, `${label} is not ready`)
  }

  ensureActorCanUseMedia({ actor, media: verifiedMedia })

  return verifiedMedia
}

export const ensureActorCanUseVideoMedia = ({
  actor,
  media,
  label = 'Video media'
}: {
  actor: MediaActor
  media: Media | null
  label?: string
}): Media => {
  const verifiedMedia = ensureMediaExists(media)

  if (verifiedMedia.type !== MediaType.video) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, `${label} must be a video`)
  }

  if (
    verifiedMedia.status !== MediaStatus.uploaded &&
    verifiedMedia.status !== MediaStatus.processing &&
    verifiedMedia.status !== MediaStatus.ready
  ) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, `${label} is not ready to use`)
  }

  ensureActorCanUseMedia({ actor, media: verifiedMedia })

  return verifiedMedia
}
