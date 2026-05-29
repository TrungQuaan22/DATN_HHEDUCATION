import { mapMediaUrl } from '~/common/mappers/media.mapper'

export const mapUserAvatar = <T extends { avatarObjectKey?: string | null}>(user: T): Omit<T, 'avatarObjectKey'> & { avatarUrl: string | null } => {
  const { avatarObjectKey, ...rest } = user

  return {
    ...rest,
    avatarUrl: mapMediaUrl(avatarObjectKey)
  }
}
