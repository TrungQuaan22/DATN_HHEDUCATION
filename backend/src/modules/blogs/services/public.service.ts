import { BlogPostStatus, type Prisma } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { applySearchCondition } from '~/common/utils/search'

import type {
  BlogPostDetailDto,
  BlogPostSummaryDto,
  ListPublicBlogCategoriesDto,
  ListPublicBlogCategoriesResponseDto,
  ListPublicBlogTagsDto,
  ListPublicBlogTagsResponseDto,
  ListPublicBlogPostsDto,
  ListPublicBlogPostsResponseDto
} from '../dto'
import { blogRepository, type PublishedBlogPost } from '../repository'
import type { BlogRepositoryPort } from '../ports/blog-repository.port'
import { mapBlogPostMedia } from '../mappers'
import { createExcerptFromContent, getReadingMinutes, countTags, countCategories } from '../utils'

const mapPublishedPostSummary = (post: PublishedBlogPost): BlogPostSummaryDto => ({
  ...mapBlogPostMedia({
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    thumbnailMediaId: post.thumbnailMediaId,
    thumbnailObjectKey: post.thumbnailObjectKey,
    author: post.author,
    tags: post.tags,
    isFeatured: post.isFeatured
  }),
  excerpt: post.excerpt ?? createExcerptFromContent(post.content),
  publishedAt: post.publishedAt ?? post.createdAt,
  readingMinutes: getReadingMinutes(post.content)
})

const mapPublishedPostDetail = (post: PublishedBlogPost): BlogPostDetailDto => ({
  ...mapPublishedPostSummary(post),
  content: post.content,
  relatedPosts: []
})

export class PublicBlogService {
  constructor(private readonly repository: BlogRepositoryPort) {}

  async listPosts(input: ListPublicBlogPostsDto): Promise<ListPublicBlogPostsResponseDto> {
    let where: Prisma.BlogPostWhereInput = {
      status: BlogPostStatus.published,
      deletedAt: null,
      publishedAt: {
        not: null
      },
      category: input.category,
      isFeatured: input.featured,
      tags: input.tag ? { has: input.tag } : undefined
    }

    where = applySearchCondition({
      where,
      search: input.search,
      field: 'title',
      tokenField: 'slug'
    })

    const skip = (input.page - 1) * input.limit
    const [items, totalItems] = await this.repository.listPublishedPosts({
      where,
      skip,
      take: input.limit
    })

    return {
      items: items.map(mapPublishedPostSummary),
      pagination: {
        page: input.page,
        limit: input.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / input.limit)
      }
    }
  }

  async listTags(input: ListPublicBlogTagsDto): Promise<ListPublicBlogTagsResponseDto> {
    const tagSources = await this.repository.listTagSources({
      status: BlogPostStatus.published,
      deletedAt: null,
      publishedAt: {
        not: null
      }
    })

    return {
      items: countTags(tagSources, input.limit)
    }
  }

  async listCategories(
    input: ListPublicBlogCategoriesDto
  ): Promise<ListPublicBlogCategoriesResponseDto> {
    const categorySources = await this.repository.listCategorySources({
      status: BlogPostStatus.published,
      deletedAt: null,
      publishedAt: {
        not: null
      }
    })

    return {
      items: countCategories(categorySources, input.limit)
    }
  }

  async getPost(slug: string): Promise<BlogPostDetailDto> {
    const post = await this.repository.findPublishedPostBySlug(slug)

    if (!post) {
      throw new AppError(404, ERROR_CODE.BLOG_POST_NOT_FOUND, ERROR_MESSAGE.BLOG_POST_NOT_FOUND)
    }

    const relatedConditions: Prisma.BlogPostWhereInput[] = []

    if (post.category) {
      relatedConditions.push({
        category: post.category
      })
    }

    if (post.tags.length > 0) {
      relatedConditions.push({
        tags: {
          hasSome: post.tags
        }
      })
    }

    const relatedPosts = await this.repository.listPublishedPostSummaries({
      where: {
        id: {
          not: post.id
        },
        status: BlogPostStatus.published,
        deletedAt: null,
        publishedAt: {
          not: null
        },
        OR: relatedConditions.length > 0 ? relatedConditions : undefined
      },
      take: 3
    })

    return {
      ...mapPublishedPostDetail(post),
      relatedPosts: relatedPosts.map(mapPublishedPostSummary)
    }
  }
}

export const publicBlogService = new PublicBlogService(blogRepository)
