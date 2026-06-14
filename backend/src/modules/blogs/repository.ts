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

function mapToBlogPostRecord(post: any): BlogPostRecord {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? '',
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
      include: {
        author: {
          select: blogAuthorSelect
        }
      }
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
      include: {
        author: {
          select: blogAuthorSelect
        }
      }
    })

    if (!post) return null
    return mapToBlogPostRecord(post)
  }

  async listPublishedPostSummaries(data: {
    where: Prisma.BlogPostWhereInput
    take: number
  }): Promise<BlogPostRecord[]> {
    const posts = await prisma.blogPost.findMany({
      where: data.where,
      take: data.take,
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      include: {
        author: {
          select: blogAuthorSelect
        }
      }
    })

    return posts.map(mapToBlogPostRecord)
  }

  async listAdminPosts(data: {
    where: Prisma.BlogPostWhereInput
    skip: number
    take: number
  }): Promise<[BlogPostRecord[], number]> {
    const [posts, total] = await prisma.$transaction([
      prisma.blogPost.findMany({
        where: data.where,
        skip: data.skip,
        take: data.take,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        include: {
          author: {
            select: blogAuthorSelect
          }
        }
      }),
      prisma.blogPost.count({
        where: data.where
      })
    ])

    return [posts.map(mapToBlogPostRecord), total]
  }

  async listPublishedPosts(data: {
    where: Prisma.BlogPostWhereInput
    skip: number
    take: number
  }): Promise<[BlogPostRecord[], number]> {
    const [posts, total] = await prisma.$transaction([
      prisma.blogPost.findMany({
        where: data.where,
        skip: data.skip,
        take: data.take,
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        include: {
          author: {
            select: blogAuthorSelect
          }
        }
      }),
      prisma.blogPost.count({
        where: data.where
      })
    ])

    return [posts.map(mapToBlogPostRecord), total]
  }

  async listTagSources(where: Prisma.BlogPostWhereInput) {
    return prisma.blogPost.findMany({
      where,
      select: {
        tags: true
      }
    })
  }

  async listCategorySources(where: Prisma.BlogPostWhereInput) {
    return prisma.blogPost.findMany({
      where,
      select: {
        category: true
      }
    })
  }

  async createPost(data: CreateBlogPostRecordInput): Promise<BlogPostRecord> {
    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        category: data.category,
        tags: data.tags ?? [],
        content: data.content,
        authorId: data.authorId,
        thumbnailMediaId: data.thumbnailMediaId,
        thumbnailObjectKey: data.thumbnailObjectKey,
        isFeatured: data.isFeatured
      },
      include: {
        author: {
          select: blogAuthorSelect
        }
      }
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
        category: data.category,
        tags: data.tags,
        content: data.content,
        thumbnailMediaId: data.thumbnailMediaId,
        thumbnailObjectKey: data.thumbnailObjectKey,
        isFeatured: data.isFeatured
      },
      include: {
        author: {
          select: blogAuthorSelect
        }
      }
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
      include: {
        author: {
          select: blogAuthorSelect
        }
      }
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
