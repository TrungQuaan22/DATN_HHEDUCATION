import type { Prisma } from '@prisma/client'
import z from 'zod'

import type { listPublicBlogPostsQuerySchema } from '../validators/public.validator'
import type { BlogAuthorDto } from './admin.dto'

export type ListPublicBlogPostsDto = z.infer<typeof listPublicBlogPostsQuerySchema>

export type ListPublicBlogTagsDto = {
  limit: number
}

export type ListPublicBlogCategoriesDto = {
  limit: number
}

export type BlogPostSummaryDto = {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string | null
  thumbnailMediaId: string | null
  thumbnailUrl: string | null
  author: BlogAuthorDto
  publishedAt: Date
  readingMinutes: number
  tags: string[]
  isFeatured: boolean
}

export type BlogPostDetailDto = BlogPostSummaryDto & {
  content: Prisma.JsonValue
  relatedPosts: BlogPostSummaryDto[]
}

export type ListPublicBlogPostsResponseDto = {
  items: BlogPostSummaryDto[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export type BlogTagSummaryDto = {
  name: string
  count: number
}

export type ListPublicBlogTagsResponseDto = {
  items: BlogTagSummaryDto[]
}

export type BlogCategorySummaryDto = {
  name: string
  count: number
}

export type ListPublicBlogCategoriesResponseDto = {
  items: BlogCategorySummaryDto[]
}
