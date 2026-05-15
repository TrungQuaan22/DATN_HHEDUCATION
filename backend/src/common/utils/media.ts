import { r2Config } from '~/config/r2'

export const buildMediaPublicUrl = (objectKey: string | null | undefined): string | null => {
  if (!objectKey || !r2Config.publicBaseUrl) {
    return null
  }

  return `${r2Config.publicBaseUrl.replace(/\/$/, '')}/${objectKey}`
}
