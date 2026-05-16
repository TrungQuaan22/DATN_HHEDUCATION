import { MediaStatus, MediaType, UserRole, type Media } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'
import { mediaRepository } from '~/modules/media/repository'

export type MediaActor = {
  id: string
  role: UserRole
}

export const ensureMediaExists = async (mediaId: string) => {
  const media = await mediaRepository.findMediaById(mediaId)

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

export const ensureActorCanUseImageMedia = async ({
  actor,
  mediaId,
  label = 'Image media'
}: {
  actor: MediaActor
  mediaId: string
  label?: string
}) => {
  const media = await ensureMediaExists(mediaId)

  if (media.type !== MediaType.image) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, `${label} must be an image`)
  }

  if (media.status !== MediaStatus.ready) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, `${label} is not ready`)
  }

  ensureActorCanUseMedia({ actor, media })

  return media
}

export const ensureActorCanUseVideoMedia = async ({
  actor,
  mediaId,
  label = 'Video media'
}: {
  actor: MediaActor
  mediaId: string
  label?: string
}) => {
  const media = await ensureMediaExists(mediaId)

  if (media.type !== MediaType.video) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, `${label} must be a video`)
  }

  if (media.status !== MediaStatus.uploaded && media.status !== MediaStatus.ready) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, `${label} is not ready to use`)
  }

  ensureActorCanUseMedia({ actor, media })

  return media
}
