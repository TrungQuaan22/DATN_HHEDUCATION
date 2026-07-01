import z from 'zod'

import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  MEDIA_RESOURCE_TYPES
} from '~/common/constant/media'

export const createPresignedUploadBodySchema = z
  .object({
    resourceType: z.enum(MEDIA_RESOURCE_TYPES),
    fileName: z.string().trim().min(1).max(255),
    contentType: z.string().trim().min(1).max(100),
    fileSize: z.number().int().positive()
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.resourceType === 'image') {
      if (!ALLOWED_IMAGE_MIME_TYPES.includes(data.contentType as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['contentType'],
          message: 'Unsupported image content type'
        })
      }

      if (data.fileSize > MAX_IMAGE_SIZE_BYTES) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['fileSize'],
          message: `Image size must not exceed ${MAX_IMAGE_SIZE_BYTES} bytes`
        })
      }
    }

    if (data.resourceType === 'video') {
      if (!ALLOWED_VIDEO_MIME_TYPES.includes(data.contentType as (typeof ALLOWED_VIDEO_MIME_TYPES)[number])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['contentType'],
          message: 'Unsupported video content type'
        })
      }

      if (data.fileSize > MAX_VIDEO_SIZE_BYTES) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['fileSize'],
          message: `Video size must not exceed ${MAX_VIDEO_SIZE_BYTES} bytes`
        })
      }
    }

    if (data.resourceType === 'document') {
      if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(data.contentType as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['contentType'],
          message: 'Unsupported document content type'
        })
      }

      if (data.fileSize > MAX_DOCUMENT_SIZE_BYTES) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['fileSize'],
          message: `Document size must not exceed ${MAX_DOCUMENT_SIZE_BYTES} bytes`
        })
      }
    }
  })

export const createPresignedUploadSchema = z.object({
  body: createPresignedUploadBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional()
})

export const completeUploadBodySchema = z
  .object({
    mediaId: z.string().uuid()
  })
  .strict()

export const completeUploadSchema = z.object({
  body: completeUploadBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional()
})
