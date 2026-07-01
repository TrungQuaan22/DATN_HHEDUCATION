import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'

import type {
  BlogPostDetailResponse,
  ListPublicBlogCategoriesDto,
  ListPublicBlogCategoriesResponse,
  ListPublicBlogPostsDto,
  ListPublicBlogPostsResponse,
  ListPublicBlogTagsDto,
  ListPublicBlogTagsResponse
} from '../dto/public.dto'
import { mapPublicBlogPostDetailResponse, mapPublicBlogPostSummaryResponse } from '../mappers'
import type { BlogRepositoryPort, BlogPostRecord } from '../ports/blog-repository.port'
import { countTags, getReadingMinutes } from '../utils'

const mapPublishedPostSummary = (post: BlogPostRecord) => {
  const readingMinutes = getReadingMinutes(post.content)
  return mapPublicBlogPostSummaryResponse(post, readingMinutes)
}

export class PublicBlogService {
  constructor(private readonly repository: BlogRepositoryPort) {}

  async listPosts(input: ListPublicBlogPostsDto): Promise<ListPublicBlogPostsResponse> {
    const [items, totalItems] = await this.repository.listPublishedPosts({
      filters: {
        categorySlug: input.categorySlug,
        isFeatured: input.featured,
        tag: input.tag,
        search: input.search
      },
      page: input.page,
      limit: input.limit
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
    const tagSources = await this.repository.listTagSources({ publishedOnly: true })

    return {
      items: countTags(tagSources, input.limit)
    }
  }

  async listCategories(
    input: ListPublicBlogCategoriesDto
  ): Promise<ListPublicBlogCategoriesResponse> {
    const categories = await this.repository.listCategories({
      publishedOnly: true,
      limit: input.limit
    })

    return {
      items: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        count: category.postCount
      }))
    }
  }

  async getPost(slug: string): Promise<BlogPostDetailResponse> {
    const post = await this.repository.findPublishedPostBySlug(slug)

    if (!post) {
      throw new AppError(404, ERROR_CODE.BLOG_POST_NOT_FOUND, ERROR_MESSAGE.BLOG_POST_NOT_FOUND)
    }

    const relatedPosts = await this.repository.listPublishedPostSummaries({
      excludedPostId: post.id,
      tags: post.tags,
      limit: 3
    })

    const readingMinutes = getReadingMinutes(post.content)
    const mappedRelatedPosts = relatedPosts.map((rp) => ({
      post: rp,
      readingMinutes: getReadingMinutes(rp.content)
    }))

    return mapPublicBlogPostDetailResponse(post, readingMinutes, mappedRelatedPosts)
  }
}
