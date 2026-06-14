import { BlogPostStatus, type Prisma } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { applySearchCondition } from '~/common/utils/search'

import type {
  BlogPostDetailResponse,
  ListPublicBlogCategoriesDto,
  ListPublicBlogCategoriesResponse,
  ListPublicBlogPostsDto,
  ListPublicBlogPostsResponse,
  ListPublicBlogTagsDto,
  ListPublicBlogTagsResponse
} from '../dto/public.dto'
import {
  mapPublicBlogPostDetailResponse,
  mapPublicBlogPostSummaryResponse
} from '../mappers'
import type { BlogRepositoryPort, BlogPostRecord } from '../ports/blog-repository.port'
import { blogRepository } from '../repository'
import { countCategories, countTags, getReadingMinutes } from '../utils'

const mapPublishedPostSummary = (post: BlogPostRecord) => {
  const readingMinutes = getReadingMinutes(post.content)
  return mapPublicBlogPostSummaryResponse(post, readingMinutes)
}

export class PublicBlogService {
  constructor(private readonly repository: BlogRepositoryPort) {}

  async listPosts(input: ListPublicBlogPostsDto): Promise<ListPublicBlogPostsResponse> {
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

  async listTags(input: ListPublicBlogTagsDto): Promise<ListPublicBlogTagsResponse> {
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
  ): Promise<ListPublicBlogCategoriesResponse> {
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

  async getPost(slug: string): Promise<BlogPostDetailResponse> {
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

    const readingMinutes = getReadingMinutes(post.content)
    const mappedRelatedPosts = relatedPosts.map((rp) => ({
      post: rp,
      readingMinutes: getReadingMinutes(rp.content)
    }))

    return mapPublicBlogPostDetailResponse(post, readingMinutes, mappedRelatedPosts)
  }
}

export const publicBlogService = new PublicBlogService(blogRepository)
