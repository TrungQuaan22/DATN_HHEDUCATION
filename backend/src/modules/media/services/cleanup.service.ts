import { MediaStatus } from '@prisma/client'

import {
  ORPHAN_IMAGE_RETENTION_HOURS,
  ORPHAN_MEDIA_CLEANUP_BATCH_SIZE,
  ORPHAN_VIDEO_RETENTION_DAYS
} from '~/common/constant/media'

import { mediaRepository } from '../repository'
import { mediaStorage } from '../adapters/r2-media-storage.adapter'
import type { MediaRepositoryPort } from '../ports/media-repository.port'
import type { MediaStoragePort } from '../ports/media-storage.port'

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

export class MediaCleanupService {
  constructor(
    private readonly repository: MediaRepositoryPort,
    private readonly storage: MediaStoragePort
  ) {}

  private async cleanupOrphanMediaByType(data: {
    type: 'image' | 'video'
    olderThan: Date
    statuses: MediaStatus[]
    limit?: number
  }) {
    const items = await this.repository.listOrphanMediaForCleanup({
      type: data.type,
      statuses: data.statuses,
      olderThan: data.olderThan,
      limit: data.limit ?? ORPHAN_MEDIA_CLEANUP_BATCH_SIZE
    })

    let deletedCount = 0

    for (const item of items) {
      await this.storage.deleteObject(item.objectKey)
      await this.repository.deleteMediaById(item.id)
      deletedCount += 1
    }

    return {
      items,
      deletedCount
    }
  }

  async cleanupOrphanMedia(limit?: number) {
    const now = new Date()

    const imageResult = await this.cleanupOrphanMediaByType({
      type: 'image',
      olderThan: subtractHours(now, ORPHAN_IMAGE_RETENTION_HOURS),
      statuses: [...IMAGE_ORPHAN_STATUSES],
      limit
    })

    const videoResult = await this.cleanupOrphanMediaByType({
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

export const mediaCleanupService = new MediaCleanupService(mediaRepository, mediaStorage)
