import { mapMediaUrl } from '~/common/mappers/media.mapper'
import { mapUserAvatar } from '~/modules/users/mappers/user.mapper'

export const mapBlogPostMedia = <
  T extends {
    thumbnailObjectKey?: string | null
    author: {
      avatarObjectKey?: string | null
    }
  }
>(
  post: T
): Omit<T, 'thumbnailObjectKey' | 'author'> & {
  thumbnailUrl: string | null
  author: Omit<T['author'], 'avatarObjectKey'> & { avatarUrl: string | null }
} => {
  const { thumbnailObjectKey, author, ...rest } = post

  return {
    ...rest,
    author: mapUserAvatar(author),
    thumbnailUrl: mapMediaUrl(thumbnailObjectKey)
  }
}
