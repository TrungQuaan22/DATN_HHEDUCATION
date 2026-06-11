import { MediaStatus, MediaType, UserRole } from '@prisma/client'
import { HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { extname } from 'path'
import { randomUUID } from 'crypto'

import { AppError } from '~/common/error/app-error'
import { ERROR_CODE } from '~/common/constant/error-code'
import { r2Client, r2Config } from '~/config/r2'
import { buildMediaPublicUrl } from '~/common/utils/media'

import type {
  CompleteUploadDto,
  CompleteUploadResponseDto,
  CreatePresignedUploadDto,
  CreatePresignedUploadResponseDto
} from '../dto/admin.dto'
import { mediaRepository } from '../repository'

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

export const adminMediaService = {
  async createPresignedUpload(
    userId: string,
    input: CreatePresignedUploadDto
  ): Promise<CreatePresignedUploadResponseDto> {
    const objectKey = buildObjectKey(input)
    const media = await mediaRepository.createMedia({
      type: getMediaType(input.resourceType),
      status: MediaStatus.pending_upload,
      objectKey,
      originalName: input.fileName,
      mimeType: input.contentType,
      sizeBytes: input.fileSize,
      uploadedById: userId
    })

    const command = new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: objectKey,
      ContentType: input.contentType
    })

    const uploadUrl = await getSignedUrl(r2Client, command, {
      expiresIn: r2Config.presignedUrlExpiresInSeconds
    })

    return {
      mediaId: media.id,
      uploadUrl,
      objectKey,
      method: 'PUT'
    }
  },

  async completeUpload(input: CompleteUploadDto): Promise<CompleteUploadResponseDto> {
    const media = await mediaRepository.findMediaById(input.mediaId)

    if (!media || media.status === MediaStatus.deleted) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Media not found')
    }

    let metadata

    try {
      metadata = await r2Client.send(
        new HeadObjectCommand({
          Bucket: r2Config.bucketName,
          Key: media.objectKey
        })
      )
    } catch {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Uploaded object not found')
    }

    const nextStatus = media.type === 'video' ? MediaStatus.uploaded : MediaStatus.ready

    const updatedMedia = await mediaRepository.updateMediaById(media.id, {
      status: nextStatus,
      mimeType: metadata.ContentType ?? media.mimeType,
      sizeBytes: metadata.ContentLength ?? media.sizeBytes,
      etag: metadata.ETag ?? null
    })

    return {
      mediaId: updatedMedia.id,
      objectKey: updatedMedia.objectKey,
      contentType: updatedMedia.mimeType,
      fileSize: updatedMedia.sizeBytes,
      etag: updatedMedia.etag ?? null,
      publicUrl: buildMediaPublicUrl(updatedMedia.objectKey)
    }
  },

  async createAuthenticatedUpload(
    user: { id: string; role: UserRole },
    input: CreatePresignedUploadDto
  ): Promise<CreatePresignedUploadResponseDto> {
    if (input.resourceType === 'video' && user.role === UserRole.student) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'Student accounts cannot upload videos')
    }

    return this.createPresignedUpload(user.id, input)
  },

  async completeAuthenticatedUpload(
    user: { id: string; role: UserRole },
    input: CompleteUploadDto
  ): Promise<CompleteUploadResponseDto> {
    const media = await mediaRepository.findMediaById(input.mediaId)

    if (!media || media.status === MediaStatus.deleted) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Media not found')
    }

    if (user.role !== UserRole.admin && media.uploadedById !== user.id) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only complete your own upload')
    }

    if (media.type === MediaType.video && user.role === UserRole.student) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'Student accounts cannot upload videos')
    }

    return this.completeUpload(input)
  }
}
