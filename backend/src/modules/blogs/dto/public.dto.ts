import type { Prisma } from '@prisma/client'
import z from 'zod'

import type { listPublicBlogPostsQuerySchema } from '../validators/public.validator'
import type { BlogAuthorResponse } from './admin.dto'

export type ListPublicBlogPostsDto = z.infer<typeof listPublicBlogPostsQuerySchema>

export type ListPublicBlogTagsDto = {
  limit: number
}

export type ListPublicBlogCategoriesDto = {
  limit: number
}

export type BlogPostSummaryResponse = {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string | null
  thumbnailMediaId: string | null
  thumbnailUrl: string | null
  author: BlogAuthorResponse
  publishedAt: Date
  readingMinutes: number
  tags: string[]
  isFeatured: boolean
}

export type BlogPostDetailResponse = BlogPostSummaryResponse & {
  content: Prisma.JsonValue
  relatedPosts: BlogPostSummaryResponse[]
}

export type ListPublicBlogPostsResponse = {
  items: BlogPostSummaryResponse[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export type BlogTagSummaryResponse = {
  name: string
  count: number
}

export type ListPublicBlogTagsResponse = {
  items: BlogTagSummaryResponse[]
}

export type BlogCategorySummaryResponse = {
  name: string
  count: number
}

export type ListPublicBlogCategoriesResponse = {
  items: BlogCategorySummaryResponse[]
}
