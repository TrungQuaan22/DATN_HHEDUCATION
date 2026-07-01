import { buildMediaPublicUrl } from '~/common/utils/media'

export const mapMediaUrl = (objectKey: string | null | undefined): string | null => {
  return buildMediaPublicUrl(objectKey)
}
