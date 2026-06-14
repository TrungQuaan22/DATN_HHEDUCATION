import z from 'zod'
import type { MediaStatus } from '@prisma/client'

import {
  completeUploadBodySchema,
  createPresignedUploadBodySchema
} from '../validators/upload.validator'

export type CreatePresignedUploadDto = z.infer<typeof createPresignedUploadBodySchema>
export type CompleteUploadDto = z.infer<typeof completeUploadBodySchema>

export type CreatePresignedUploadResponse = {
  mediaId: string
  uploadUrl: string
  objectKey: string
  method: 'PUT'
}

export type CompleteUploadResponse = {
  mediaId: string
  objectKey: string
  status: MediaStatus
  contentType: string | null
  fileSize: number | null
  etag: string | null
  publicUrl: string | null
}
