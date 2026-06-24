import { mediaStorage } from './adapters/r2-media-storage.adapter'
import { mediaRepository } from './repository'
import { MediaCleanupService } from './services/cleanup.service'
import { TranscodeService } from './services/transcode.service'
import { MediaUploadService } from './services/upload.service'

export const transcodeService = new TranscodeService(mediaRepository, mediaStorage)
export const mediaUploadService = new MediaUploadService(
  mediaRepository,
  mediaStorage,
  transcodeService
)
export const mediaCleanupService = new MediaCleanupService(mediaRepository, mediaStorage)
