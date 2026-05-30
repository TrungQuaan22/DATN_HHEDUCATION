import type { Media, MediaStatus, MediaType, Prisma } from '@prisma/client'

export interface MediaRepositoryPort {
  createMedia(data: {
    type: MediaType
    status: MediaStatus
    objectKey: string
    originalName: string
    mimeType: string
    sizeBytes: number
    uploadedById: string
  }): Promise<Media>
  findMediaById(mediaId: string): Promise<Media | null>
  updateMediaById(mediaId: string, data: Prisma.MediaUpdateInput): Promise<Media>
  listOrphanMediaForCleanup(data: {
    type: MediaType
    statuses: MediaStatus[]
    olderThan: Date
    limit: number
  }): Promise<Media[]>
  deleteMediaById(mediaId: string): Promise<Media>
  lockMediaForTranscoding(mediaId: string): Promise<boolean>
  markMediaReady(data: {
    mediaId: string
    playlistObjectKey: string
    durationSec: number | null
  }): Promise<void>
  markMediaFailed(mediaId: string): Promise<void>
}
