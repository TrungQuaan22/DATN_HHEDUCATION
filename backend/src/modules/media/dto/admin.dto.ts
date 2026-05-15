import z from 'zod'

import {
  completeUploadBodySchema,
  createPresignedUploadBodySchema
} from '../validators/admin.validator'

export type CreatePresignedUploadDto = z.infer<typeof createPresignedUploadBodySchema>
export type CompleteUploadDto = z.infer<typeof completeUploadBodySchema>

export type CreatePresignedUploadResponseDto = {
  mediaId: string
  uploadUrl: string
  objectKey: string
  method: 'PUT'
}

export type CompleteUploadResponseDto = {
  mediaId: string
  objectKey: string
  contentType: string | null
  fileSize: number | null
  etag: string | null
  publicUrl: string | null
}
