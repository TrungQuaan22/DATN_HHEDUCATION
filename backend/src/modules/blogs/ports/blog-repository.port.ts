import type { BlogPostStatus, Prisma } from '@prisma/client'

export type BlogAuthorRecord = {
  id: string
  fullName: string
  avatarMediaId: string | null
  avatarObjectKey: string | null
}

export type BlogPostRecord = {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string | null
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
  category?: string | null
  tags?: string[]
  content: Prisma.InputJsonValue
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
  category?: string | null
  tags?: string[]
  content?: Prisma.InputJsonValue
  thumbnailMediaId?: string | null
  thumbnailObjectKey?: string | null
  isFeatured?: boolean
}

export interface BlogRepositoryPort {
  findActivePostBySlug(slug: string): Promise<{ id: string } | null>
  findActivePostById(blogPostId: string): Promise<BlogPostRecord | null>
  findPublishedPostBySlug(slug: string): Promise<BlogPostRecord | null>
  listPublishedPostSummaries(data: {
    where: Prisma.BlogPostWhereInput
    take: number
  }): Promise<BlogPostRecord[]>
  listAdminPosts(data: {
    where: Prisma.BlogPostWhereInput
    skip: number
    take: number
  }): Promise<[BlogPostRecord[], number]>
  listPublishedPosts(data: {
    where: Prisma.BlogPostWhereInput
    skip: number
    take: number
  }): Promise<[BlogPostRecord[], number]>
  listTagSources(where: Prisma.BlogPostWhereInput): Promise<Array<{ tags: string[] }>>
  listCategorySources(where: Prisma.BlogPostWhereInput): Promise<Array<{ category: string | null }>>
  createPost(data: CreateBlogPostRecordInput): Promise<BlogPostRecord>
  updatePost(data: UpdateBlogPostRecordInput): Promise<BlogPostRecord>
  updateStatus(data: {
    blogPostId: string
    status: BlogPostStatus
    publishedAt?: Date | null
  }): Promise<BlogPostRecord>
  softDeletePost(blogPostId: string): Promise<{ id: string }>
}
