import type { BlogPostStatus, Prisma, UserRole } from '@prisma/client'
import z from 'zod'

import type {
  createBlogCategoryBodySchema,
  createBlogPostBodySchema,
  listAdminBlogPostsQuerySchema,
  updateBlogPostBodySchema
} from '../validators/admin.validator'

export type CreateBlogCategoryDto = z.infer<typeof createBlogCategoryBodySchema>

export type CreateBlogPostDto = z.infer<typeof createBlogPostBodySchema> & {
  authorId: string
  actorRole: UserRole
}

export type UpdateBlogPostDto = z.infer<typeof updateBlogPostBodySchema> & {
  blogPostId: string
  actorId: string
  actorRole: UserRole
}

export type BlogPostIdDto = {
  blogPostId: string
  actorId: string
  actorRole: UserRole
}

export type ListAdminBlogPostsDto = z.infer<typeof listAdminBlogPostsQuerySchema> & {
  actorId: string
  actorRole: UserRole
}

export type ListAdminBlogTagsDto = {
  actorId: string
  actorRole: UserRole
  limit: number
}

export type ListAdminBlogCategoriesDto = {
  actorId: string
  actorRole: UserRole
  limit: number
}

export type BlogAuthorResponse = {
  id: string
  fullName: string
  avatarMediaId: string | null
  avatarUrl: string | null
}

export type AdminBlogPostResponse = {
  id: string
  title: string
  slug: string
  excerpt: string
  category: BlogCategoryResponse | null
  tags: string[]
  content: Prisma.JsonValue
  author: BlogAuthorResponse
  thumbnailMediaId: string | null
  thumbnailUrl: string | null
  status: BlogPostStatus
  isFeatured: boolean
  publishedAt: Date | null
  readingMinutes: number
  createdAt: Date
  updatedAt: Date
}

export type AdminBlogPostSummaryResponse = {
  id: string
  title: string
  slug: string
  excerpt: string
  category: BlogCategoryResponse | null
  tags: string[]
  author: BlogAuthorResponse
  thumbnailMediaId: string | null
  thumbnailUrl: string | null
  status: BlogPostStatus
  isFeatured: boolean
  publishedAt: Date | null
  readingMinutes: number
  createdAt: Date
  updatedAt: Date
}

export type ListAdminBlogPostsResponse = {
  items: AdminBlogPostSummaryResponse[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export type AdminBlogTagSummaryResponse = {
  name: string
  count: number
}

export type ListAdminBlogTagsResponse = {
  items: AdminBlogTagSummaryResponse[]
}

export type BlogCategoryResponse = {
  id: string
  name: string
  slug: string
}

export type AdminBlogCategorySummaryResponse = BlogCategoryResponse & {
  count: number
}

export type ListAdminBlogCategoriesResponse = {
  items: AdminBlogCategorySummaryResponse[]
}
