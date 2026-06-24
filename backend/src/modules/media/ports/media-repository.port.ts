import type { Media, MediaStatus, MediaType } from '@prisma/client'

export type { MediaStatus, MediaType }

export type MediaRecord = Media

export type UpdateMediaData = {
  status?: MediaStatus
  mimeType?: string
  sizeBytes?: number
  etag?: string | null
}

export interface MediaRepositoryPort {
  createMedia(data: {
    type: MediaType
    status: MediaStatus
    objectKey: string
    originalName: string
    mimeType: string
    sizeBytes: number
    uploadedById: string
  }): Promise<MediaRecord>
  findMediaById(mediaId: string): Promise<MediaRecord | null>
  updateMediaById(mediaId: string, data: UpdateMediaData): Promise<MediaRecord>
  listOrphanMediaForCleanup(data: {
    type: MediaType
    statuses: MediaStatus[]
    olderThan: Date
    limit: number
  }): Promise<MediaRecord[]>
  deleteMediaById(mediaId: string): Promise<MediaRecord>
  lockMediaForTranscoding(mediaId: string): Promise<boolean>
  markMediaReady(data: {
    mediaId: string
    playlistObjectKey: string
    durationSec: number | null
  }): Promise<void>
  markMediaFailed(mediaId: string): Promise<void>
}
