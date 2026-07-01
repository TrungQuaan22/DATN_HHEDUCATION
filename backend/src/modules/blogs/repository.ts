import { BlogPostStatus, type Prisma } from '@prisma/client'

import { prisma } from '~/config/db'

import type {
  BlogPostRecord,
  BlogRepositoryPort,
  CreateBlogPostRecordInput,
  UpdateBlogPostRecordInput
} from './ports/blog-repository.port'

const blogAuthorSelect = {
  id: true,
  fullName: true,
  avatarMediaId: true,
  avatarObjectKey: true
} satisfies Prisma.UserSelect

const blogPostInclude = {
  author: {
    select: blogAuthorSelect
  },
  category: true
} satisfies Prisma.BlogPostInclude

type PrismaBlogPostRecord = Prisma.BlogPostGetPayload<{
  include: typeof blogPostInclude
}>

type BlogListFilters = {
  status?: 'draft' | 'published'
  authorId?: string
  categorySlug?: string
  isFeatured?: boolean
  tag?: string
  search?: string
}

function buildBlogWhere(filters: BlogListFilters): Prisma.BlogPostWhereInput {
  const where: Prisma.BlogPostWhereInput = {
    deletedAt: null,
    status: filters.status,
    authorId: filters.authorId,
    category: filters.categorySlug ? { slug: filters.categorySlug } : undefined,
    isFeatured: filters.isFeatured,
    tags: filters.tag ? { has: filters.tag } : undefined
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { slug: { contains: filters.search, mode: 'insensitive' } }
    ]
  }

  return where
}

function buildSourceWhere(data: {
  publishedOnly: boolean
  authorId?: string
}): Prisma.BlogPostWhereInput {
  return {
    deletedAt: null,
    authorId: data.authorId,
    status: data.publishedOnly ? BlogPostStatus.published : undefined,
    publishedAt: data.publishedOnly ? { not: null } : undefined
  }
}

function toInputJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

function mapToBlogPostRecord(post: PrismaBlogPostRecord): BlogPostRecord {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? '',
    categoryId: post.categoryId,
    category: post.category,
    tags: post.tags,
    content: post.content,
    thumbnailMediaId: post.thumbnailMediaId,
    thumbnailObjectKey: post.thumbnailObjectKey,
    authorId: post.authorId,
    author: {
      id: post.author.id,
      fullName: post.author.fullName,
      avatarMediaId: post.author.avatarMediaId,
      avatarObjectKey: post.author.avatarObjectKey
    },
    status: post.status,
    isFeatured: post.isFeatured,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  }
}

export class PrismaBlogRepository implements BlogRepositoryPort {
  async findActivePostBySlug(slug: string) {
    return prisma.blogPost.findFirst({
      where: {
        slug,
        deletedAt: null
      },
      select: {
        id: true
      }
    })
  }

  async findActivePostById(blogPostId: string): Promise<BlogPostRecord | null> {
    const post = await prisma.blogPost.findFirst({
      where: {
        id: blogPostId,
        deletedAt: null
      },
      include: blogPostInclude
    })

    if (!post) return null
    return mapToBlogPostRecord(post)
  }

  async findPublishedPostBySlug(slug: string): Promise<BlogPostRecord | null> {
    const post = await prisma.blogPost.findFirst({
      where: {
        slug,
        status: BlogPostStatus.published,
        deletedAt: null,
        publishedAt: {
          not: null
        }
      },
      include: blogPostInclude
    })

    if (!post) return null
    return mapToBlogPostRecord(post)
  }

  async listPublishedPostSummaries(data: {
    excludedPostId: string
    tags: string[]
    limit: number
  }): Promise<BlogPostRecord[]> {
    if (data.tags.length === 0) return []

    const posts = await prisma.blogPost.findMany({
      where: {
        id: { not: data.excludedPostId },
        status: BlogPostStatus.published,
        deletedAt: null,
        publishedAt: { not: null },
        tags: data.tags.length > 0 ? { hasSome: data.tags } : undefined
      },
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      include: blogPostInclude
    })

    return posts
      .map(mapToBlogPostRecord)
      .sort((left, right) => {
        const leftMatches = left.tags.filter((tag) => data.tags.includes(tag)).length
        const rightMatches = right.tags.filter((tag) => data.tags.includes(tag)).length
        return rightMatches - leftMatches
      })
      .slice(0, data.limit)
  }

  async listAdminPosts(data: {
    filters: BlogListFilters
    page: number
    limit: number
  }): Promise<[BlogPostRecord[], number]> {
    const where = buildBlogWhere(data.filters)
    const skip = (data.page - 1) * data.limit

    const [posts, total] = await prisma.$transaction([
      prisma.blogPost.findMany({
        where,
        skip,
        take: data.limit,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        include: blogPostInclude
      }),
      prisma.blogPost.count({
        where
      })
    ])

    return [posts.map(mapToBlogPostRecord), total]
  }

  async listPublishedPosts(data: {
    filters: Omit<BlogListFilters, 'status' | 'authorId'>
    page: number
    limit: number
  }): Promise<[BlogPostRecord[], number]> {
    const where = buildBlogWhere({
      ...data.filters,
      status: 'published'
    })
    where.publishedAt = { not: null }
    const skip = (data.page - 1) * data.limit

    const [posts, total] = await prisma.$transaction([
      prisma.blogPost.findMany({
        where,
        skip,
        take: data.limit,
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        include: blogPostInclude
      }),
      prisma.blogPost.count({
        where
      })
    ])

    return [posts.map(mapToBlogPostRecord), total]
  }

  async listTagSources(data: { publishedOnly: boolean; authorId?: string }) {
    return prisma.blogPost.findMany({
      where: buildSourceWhere(data),
      select: {
        tags: true
      }
    })
  }

  findCategoryById(categoryId: string) {
    return prisma.blogCategory.findUnique({ where: { id: categoryId } })
  }

  findCategoryBySlug(slug: string) {
    return prisma.blogCategory.findUnique({ where: { slug } })
  }

  async listCategories(data: { publishedOnly: boolean; limit: number }) {
    const categories = await prisma.blogCategory.findMany({
      take: data.limit,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            posts: data.publishedOnly
              ? { where: { status: BlogPostStatus.published, deletedAt: null } }
              : { where: { deletedAt: null } }
          }
        }
      }
    })

    return categories.map(({ _count, ...category }) => ({
      ...category,
      postCount: _count.posts
    }))
  }

  createCategory(data: { name: string; slug: string }) {
    return prisma.blogCategory.create({ data })
  }

  async createPost(data: CreateBlogPostRecordInput): Promise<BlogPostRecord> {
    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        categoryId: data.categoryId,
        tags: data.tags ?? [],
        content: toInputJson(data.content),
        contentMedia: data.contentMediaIds?.length
          ? { create: data.contentMediaIds.map((mediaId) => ({ mediaId })) }
          : undefined,
        authorId: data.authorId,
        thumbnailMediaId: data.thumbnailMediaId,
        thumbnailObjectKey: data.thumbnailObjectKey,
        isFeatured: data.isFeatured
      },
      include: blogPostInclude
    })

    return mapToBlogPostRecord(post)
  }

  async updatePost(data: UpdateBlogPostRecordInput): Promise<BlogPostRecord> {
    const post = await prisma.blogPost.update({
      where: {
        id: data.blogPostId
      },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        categoryId: data.categoryId,
        tags: data.tags,
        content: data.content === undefined ? undefined : toInputJson(data.content),
        contentMedia:
          data.contentMediaIds === undefined
            ? undefined
            : {
                deleteMany: {},
                create: data.contentMediaIds.map((mediaId) => ({ mediaId }))
              },
        thumbnailMediaId: data.thumbnailMediaId,
        thumbnailObjectKey: data.thumbnailObjectKey,
        isFeatured: data.isFeatured
      },
      include: blogPostInclude
    })

    return mapToBlogPostRecord(post)
  }

  async updateStatus(data: {
    blogPostId: string
    status: BlogPostStatus
    publishedAt?: Date | null
  }): Promise<BlogPostRecord> {
    const post = await prisma.blogPost.update({
      where: {
        id: data.blogPostId
      },
      data: {
        status: data.status,
        publishedAt: data.publishedAt
      },
      include: blogPostInclude
    })

    return mapToBlogPostRecord(post)
  }

  async softDeletePost(blogPostId: string) {
    return prisma.blogPost.update({
      where: {
        id: blogPostId
      },
      data: {
        deletedAt: new Date()
      },
      select: {
        id: true
      }
    })
  }
}

export const blogRepository = new PrismaBlogRepository()
