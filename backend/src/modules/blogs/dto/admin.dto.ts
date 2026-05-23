import type { BlogPostStatus, Prisma, UserRole } from '@prisma/client'
import z from 'zod'

import type {
  createBlogPostBodySchema,
  listAdminBlogPostsQuerySchema,
  updateBlogPostBodySchema
} from '../validators/admin.validator'

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

export type BlogAuthorDto = {
  id: string
  fullName: string
  avatarMediaId: string | null
  avatarUrl: string | null
}

export type AdminBlogPostDto = {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string | null
  tags: string[]
  content: Prisma.JsonValue
  author: BlogAuthorDto
  thumbnailMediaId: string | null
  thumbnailUrl: string | null
  status: BlogPostStatus
  isFeatured: boolean
  publishedAt: Date | null
  readingMinutes: number
  createdAt: Date
  updatedAt: Date
}

export type AdminBlogPostSummaryDto = Omit<AdminBlogPostDto, 'content'>

export type ListAdminBlogPostsResponseDto = {
  items: AdminBlogPostSummaryDto[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export type AdminBlogTagSummaryDto = {
  name: string
  count: number
}

export type ListAdminBlogTagsResponseDto = {
  items: AdminBlogTagSummaryDto[]
}

export type AdminBlogCategorySummaryDto = {
  name: string
  count: number
}

export type ListAdminBlogCategoriesResponseDto = {
  items: AdminBlogCategorySummaryDto[]
}
