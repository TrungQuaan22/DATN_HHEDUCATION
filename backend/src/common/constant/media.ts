export const MEDIA_RESOURCE_TYPES = ['image', 'video'] as const

export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4'] as const

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
export const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024 // 500 MB

export const ORPHAN_IMAGE_RETENTION_HOURS = 24
export const ORPHAN_VIDEO_RETENTION_DAYS = 3
export const ORPHAN_MEDIA_CLEANUP_BATCH_SIZE = 100
