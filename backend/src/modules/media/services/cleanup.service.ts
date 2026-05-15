import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { MediaStatus } from '@prisma/client'

import {
  ORPHAN_IMAGE_RETENTION_HOURS,
  ORPHAN_MEDIA_CLEANUP_BATCH_SIZE,
  ORPHAN_VIDEO_RETENTION_DAYS
} from '~/common/constant/media'
import { r2Client, r2Config } from '~/config/r2'

import { mediaRepository } from '../repository'

const IMAGE_ORPHAN_STATUSES = [
  MediaStatus.pending_upload,
  MediaStatus.uploaded,
  MediaStatus.ready,
  MediaStatus.failed
] as const

const VIDEO_ORPHAN_STATUSES = [
  MediaStatus.pending_upload,
  MediaStatus.uploaded,
  MediaStatus.ready,
  MediaStatus.failed
] as const

const subtractHours = (date: Date, hours: number) => new Date(date.getTime() - hours * 60 * 60 * 1000)

const subtractDays = (date: Date, days: number) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)

const deleteObjectByKey = async (objectKey: string) => {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: r2Config.bucketName,
      Key: objectKey
    })
  )
}

const cleanupOrphanMediaByType = async (data: {
  type: 'image' | 'video'
  olderThan: Date
  statuses: MediaStatus[]
  limit?: number
}) => {
  const items = await mediaRepository.listOrphanMediaForCleanup({
    type: data.type,
    statuses: data.statuses,
    olderThan: data.olderThan,
    limit: data.limit ?? ORPHAN_MEDIA_CLEANUP_BATCH_SIZE
  })

  let deletedCount = 0

  for (const item of items) {
    await deleteObjectByKey(item.objectKey)
    await mediaRepository.deleteMediaById(item.id)
    deletedCount += 1
  }

  return {
    items,
    deletedCount
  }
}

export const mediaCleanupService = {
  async cleanupOrphanMedia(limit?: number) {
    const now = new Date()

    const imageResult = await cleanupOrphanMediaByType({
      type: 'image',
      olderThan: subtractHours(now, ORPHAN_IMAGE_RETENTION_HOURS),
      statuses: [...IMAGE_ORPHAN_STATUSES],
      limit
    })

    const videoResult = await cleanupOrphanMediaByType({
      type: 'video',
      olderThan: subtractDays(now, ORPHAN_VIDEO_RETENTION_DAYS),
      statuses: [...VIDEO_ORPHAN_STATUSES],
      limit
    })

    return {
      deletedImages: imageResult.deletedCount,
      deletedVideos: videoResult.deletedCount,
      deletedTotal: imageResult.deletedCount + videoResult.deletedCount
    }
  }
}
