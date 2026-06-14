import { MediaStatus, MediaType, UserRole } from '@prisma/client'
import { extname } from 'path'
import { randomUUID } from 'crypto'

import { AppError } from '~/common/error/app-error'
import { ERROR_CODE } from '~/common/constant/error-code'
import { buildMediaPublicUrl } from '~/common/utils/media'

import type {
  CompleteUploadDto,
  CompleteUploadResponse,
  CreatePresignedUploadDto,
  CreatePresignedUploadResponse
} from '../dto'
import { mediaRepository } from '../repository'
import { transcodeService } from './transcode.service'
import { mediaStorage } from '../adapters/r2-media-storage.adapter'
import type { MediaRepositoryPort } from '../ports/media-repository.port'
import type { MediaStoragePort } from '../ports/media-storage.port'

const getSafeExtension = (fileName: string): string => {
  const extension = extname(fileName).toLowerCase()

  if (!extension) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'File extension is required')
  }

  return extension
}

const buildObjectKey = (input: CreatePresignedUploadDto): string => {
  const extension = getSafeExtension(input.fileName)
  const assetId = randomUUID()

  if (input.resourceType === 'image') {
    return `uploads/images/${assetId}${extension}`
  }

  if (input.resourceType === 'document') {
    return `uploads/documents/${assetId}${extension}`
  }

  return `uploads/videos/source/${assetId}${extension}`
}

const getMediaType = (resourceType: CreatePresignedUploadDto['resourceType']): MediaType => {
  if (resourceType === 'image') {
    return 'image'
  }

  if (resourceType === 'document') {
    return 'document'
  }

  return 'video'
}

const ensureCanUploadResourceType = (
  user: { role: UserRole },
  resourceType: CreatePresignedUploadDto['resourceType']
) => {
  if (user.role === UserRole.student && resourceType === 'video') {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'Student accounts cannot upload videos')
  }
}

export class MediaUploadService {
  constructor(
    private readonly repository: MediaRepositoryPort,
    private readonly storage: MediaStoragePort,
    private readonly transcoder = transcodeService
  ) {}

  private async createUploadRecord(
    userId: string,
    input: CreatePresignedUploadDto
  ): Promise<CreatePresignedUploadResponse> {
    const objectKey = buildObjectKey(input)
    const media = await this.repository.createMedia({
      type: getMediaType(input.resourceType),
      status: MediaStatus.pending_upload,
      objectKey,
      originalName: input.fileName,
      mimeType: input.contentType,
      sizeBytes: input.fileSize,
      uploadedById: userId
    })

    const uploadUrl = await this.storage.createPresignedPutUrl({
      objectKey,
      contentType: input.contentType
    })

    return {
      mediaId: media.id,
      uploadUrl,
      objectKey,
      method: 'PUT'
    }
  }

  private async completeUploadRecord(mediaId: string): Promise<CompleteUploadResponse> {
    const media = await this.repository.findMediaById(mediaId)

    if (!media || media.status === MediaStatus.deleted) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Media not found')
    }

    if (media.status === MediaStatus.ready || media.status === MediaStatus.processing) {
      return {
        mediaId: media.id,
        objectKey: media.objectKey,
        status: media.status,
        contentType: media.mimeType,
        fileSize: media.sizeBytes,
        etag: media.etag ?? null,
        publicUrl: buildMediaPublicUrl(media.objectKey)
      }
    }

    let metadata

    try {
      metadata = await this.storage.headObject(media.objectKey)
    } catch {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Uploaded object not found')
    }

    if (!metadata) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Uploaded object not found')
    }

    const nextStatus = media.type === 'video' ? MediaStatus.uploaded : MediaStatus.ready

    const updatedMedia = await this.repository.updateMediaById(media.id, {
      status: nextStatus,
      mimeType: metadata.contentType ?? media.mimeType,
      sizeBytes: metadata.contentLength ?? media.sizeBytes,
      etag: metadata.etag ?? null
    })

    if (updatedMedia.type === MediaType.video) {
      setImmediate(() => {
        this.transcoder.startHlsTranscoding(updatedMedia.id).catch((error) => {
          console.error(`[Transcode Trigger Failed] MediaId ${updatedMedia.id}:`, error)
        })
      })
    }

    return {
      mediaId: updatedMedia.id,
      objectKey: updatedMedia.objectKey,
      status: updatedMedia.status,
      contentType: updatedMedia.mimeType,
      fileSize: updatedMedia.sizeBytes,
      etag: updatedMedia.etag ?? null,
      publicUrl: buildMediaPublicUrl(updatedMedia.objectKey)
    }
  }

  async createUpload(
    user: { id: string; role: UserRole },
    input: CreatePresignedUploadDto
  ): Promise<CreatePresignedUploadResponse> {
    ensureCanUploadResourceType(user, input.resourceType)

    return this.createUploadRecord(user.id, input)
  }

  async completeUpload(
    user: { id: string; role: UserRole },
    input: CompleteUploadDto
  ): Promise<CompleteUploadResponse> {
    const media = await this.repository.findMediaById(input.mediaId)

    if (!media || media.status === MediaStatus.deleted) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Media not found')
    }

    if (user.role !== UserRole.admin && media.uploadedById !== user.id) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only complete your own upload')
    }

    if (media.type === MediaType.video && user.role === UserRole.student) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'Student accounts cannot upload videos')
    }

    return this.completeUploadRecord(input.mediaId)
  }
}

export const mediaUploadService = new MediaUploadService(
  mediaRepository,
  mediaStorage,
  transcodeService
)
