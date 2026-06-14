import { mapMediaUrl } from '~/common/mappers/media.mapper'

import type {
  AdminBlogPostResponse,
  AdminBlogPostSummaryResponse,
  BlogAuthorResponse
} from '../dto/admin.dto'
import type {
  BlogPostDetailResponse,
  BlogPostSummaryResponse
} from '../dto/public.dto'
import type { BlogAuthorRecord, BlogPostRecord } from '../ports/blog-repository.port'

const mapAuthor = (author: BlogAuthorRecord): BlogAuthorResponse => ({
  id: author.id,
  fullName: author.fullName,
  avatarMediaId: author.avatarMediaId,
  avatarUrl: mapMediaUrl(author.avatarObjectKey)
})

export const mapAdminBlogPostResponse = (
  post: BlogPostRecord,
  readingMinutes: number
): AdminBlogPostResponse => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt ?? '',
  category: post.category,
  tags: post.tags,
  content: post.content,
  author: mapAuthor(post.author),
  thumbnailMediaId: post.thumbnailMediaId,
  thumbnailUrl: mapMediaUrl(post.thumbnailObjectKey),
  status: post.status,
  isFeatured: post.isFeatured,
  publishedAt: post.publishedAt,
  readingMinutes,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt
})

export const mapAdminBlogPostSummaryResponse = (
  post: BlogPostRecord,
  readingMinutes: number
): AdminBlogPostSummaryResponse => {
  const { content, ...rest } = mapAdminBlogPostResponse(post, readingMinutes)
  return rest
}

export const mapPublicBlogPostSummaryResponse = (
  post: BlogPostRecord,
  readingMinutes: number
): BlogPostSummaryResponse => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt ?? '',
  category: post.category,
  thumbnailMediaId: post.thumbnailMediaId,
  thumbnailUrl: mapMediaUrl(post.thumbnailObjectKey),
  author: mapAuthor(post.author),
  publishedAt: post.publishedAt ?? post.createdAt,
  readingMinutes,
  tags: post.tags,
  isFeatured: post.isFeatured
})

export const mapPublicBlogPostDetailResponse = (
  post: BlogPostRecord,
  readingMinutes: number,
  relatedPosts: Array<{ post: BlogPostRecord; readingMinutes: number }>
): BlogPostDetailResponse => ({
  ...mapPublicBlogPostSummaryResponse(post, readingMinutes),
  content: post.content,
  relatedPosts: relatedPosts.map((r) => mapPublicBlogPostSummaryResponse(r.post, r.readingMinutes))
})
