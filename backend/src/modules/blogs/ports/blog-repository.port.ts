import type { BlogPostStatus, Prisma } from '@prisma/client'

export type { BlogPostStatus }

export type BlogAuthorRecord = {
  id: string
  fullName: string
  avatarMediaId: string | null
  avatarObjectKey: string | null
}

export type BlogCategoryRecord = {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export type BlogPostRecord = {
  id: string
  title: string
  slug: string
  excerpt: string
  categoryId: string | null
  category: BlogCategoryRecord | null
  tags: string[]
  content: Prisma.JsonValue
  thumbnailMediaId: string | null
  thumbnailObjectKey: string | null
  authorId: string
  author: BlogAuthorRecord
  status: BlogPostStatus
  isFeatured: boolean
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type CreateBlogPostRecordInput = {
  title: string
  slug: string
  excerpt?: string | null
  categoryId?: string | null
  tags?: string[]
  content: unknown
  contentMediaIds?: string[]
  authorId: string
  thumbnailMediaId?: string | null
  thumbnailObjectKey?: string | null
  isFeatured?: boolean
}

export type UpdateBlogPostRecordInput = {
  blogPostId: string
  title?: string
  slug?: string
  excerpt?: string | null
  categoryId?: string | null
  tags?: string[]
  content?: unknown
  contentMediaIds?: string[]
  thumbnailMediaId?: string | null
  thumbnailObjectKey?: string | null
  isFeatured?: boolean
}

export interface BlogRepositoryPort {
  findActivePostBySlug(slug: string): Promise<{ id: string } | null>
  findActivePostById(blogPostId: string): Promise<BlogPostRecord | null>
  findPublishedPostBySlug(slug: string): Promise<BlogPostRecord | null>
  listPublishedPostSummaries(data: {
    excludedPostId: string
    tags: string[]
    limit: number
  }): Promise<BlogPostRecord[]>
  listAdminPosts(data: {
    filters: {
      status?: BlogPostStatus
      authorId?: string
      categorySlug?: string
      isFeatured?: boolean
      tag?: string
      search?: string
    }
    page: number
    limit: number
  }): Promise<[BlogPostRecord[], number]>
  listPublishedPosts(data: {
    filters: {
      categorySlug?: string
      isFeatured?: boolean
      tag?: string
      search?: string
    }
    page: number
    limit: number
  }): Promise<[BlogPostRecord[], number]>
  listTagSources(data: {
    publishedOnly: boolean
    authorId?: string
  }): Promise<Array<{ tags: string[] }>>
  findCategoryById(categoryId: string): Promise<BlogCategoryRecord | null>
  findCategoryBySlug(slug: string): Promise<BlogCategoryRecord | null>
  listCategories(data: {
    publishedOnly: boolean
    limit: number
  }): Promise<Array<BlogCategoryRecord & { postCount: number }>>
  createCategory(data: { name: string; slug: string }): Promise<BlogCategoryRecord>
  createPost(data: CreateBlogPostRecordInput): Promise<BlogPostRecord>
  updatePost(data: UpdateBlogPostRecordInput): Promise<BlogPostRecord>
  updateStatus(data: {
    blogPostId: string
    status: BlogPostStatus
    publishedAt?: Date | null
  }): Promise<BlogPostRecord>
  softDeletePost(blogPostId: string): Promise<{ id: string }>
}
