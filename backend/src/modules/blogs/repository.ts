import { BlogPostStatus, type Prisma } from '@prisma/client'

import { prisma } from '~/config/db'
import type {
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

export class PrismaBlogRepository implements BlogRepositoryPort {
  findActivePostBySlug(slug: string) {
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

  findActivePostById(blogPostId: string) {
    return prisma.blogPost.findFirst({
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
  }

  findPublishedPostBySlug(slug: string) {
    return prisma.blogPost.findFirst({
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
  }

  listPublishedPostSummaries(data: { where: Prisma.BlogPostWhereInput; take: number }) {
    return prisma.blogPost.findMany({
      where: data.where,
      take: data.take,
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      include: {
        author: {
          select: blogAuthorSelect
        }
      }
    })
  }

  listAdminPosts(data: { where: Prisma.BlogPostWhereInput; skip: number; take: number }) {
    return prisma.$transaction([
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
  }

  listPublishedPosts(data: { where: Prisma.BlogPostWhereInput; skip: number; take: number }) {
    return prisma.$transaction([
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
  }

  listTagSources(where: Prisma.BlogPostWhereInput) {
    return prisma.blogPost.findMany({
      where,
      select: {
        tags: true
      }
    })
  }

  listCategorySources(where: Prisma.BlogPostWhereInput) {
    return prisma.blogPost.findMany({
      where,
      select: {
        category: true
      }
    })
  }

  createPost(data: CreateBlogPostRecordInput) {
    return prisma.blogPost.create({
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
  }

  updatePost(data: UpdateBlogPostRecordInput) {
    return prisma.blogPost.update({
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
  }

  updateStatus(data: {
    blogPostId: string
    status: BlogPostStatus
    publishedAt?: Date | null
  }) {
    return prisma.blogPost.update({
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
  }

  softDeletePost(blogPostId: string) {
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

export type {
  BlogPostWithAuthor,
  PublishedBlogPost
} from './ports/blog-repository.port'

