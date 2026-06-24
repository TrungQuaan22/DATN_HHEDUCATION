import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { ensureMediaExists } from '~/common/ensures/media.ensure'
import { validateImageMedia } from '~/common/policies/media.policy'
import { AppError } from '~/common/error/app-error'
import type { MediaRepositoryPort } from '~/modules/media/ports/media-repository.port'

import type {
  AdminBlogPostResponse,
  AdminBlogPostSummaryResponse,
  BlogPostIdDto,
  CreateBlogCategoryDto,
  CreateBlogPostDto,
  ListAdminBlogCategoriesDto,
  ListAdminBlogCategoriesResponse,
  ListAdminBlogPostsDto,
  ListAdminBlogPostsResponse,
  ListAdminBlogTagsDto,
  ListAdminBlogTagsResponse,
  UpdateBlogPostDto
} from '../dto/admin.dto'
import { mapAdminBlogPostResponse, mapAdminBlogPostSummaryResponse } from '../mappers'
import type { BlogRepositoryPort, BlogPostRecord } from '../ports/blog-repository.port'
import { countTags, getReadingMinutes } from '../utils'
import { getRichContentMediaIds, normalizeRichContentHeadingIds, countRichContentWords } from '../utils/rich-content'
import { validateCanManagePost } from '../policies/blog.policy'
import { createSlugFromText } from '~/common/utils/slug'
import { normalizeText } from '~/common/utils/search'

const mapBlogPost = (post: BlogPostRecord): AdminBlogPostResponse => {
  return mapAdminBlogPostResponse(post, getReadingMinutes(post.content))
}

const mapBlogPostSummary = (post: BlogPostRecord): AdminBlogPostSummaryResponse => {
  return mapAdminBlogPostSummaryResponse(post, getReadingMinutes(post.content))
}

const createBlogPostSlug = async (
  repository: BlogRepositoryPort,
  title: string,
  explicitSlug?: string
): Promise<string> => {
  const slug = explicitSlug ?? createSlugFromText(normalizeText(title))
  const existedPost = await repository.findActivePostBySlug(slug)

  if (existedPost) {
    throw new AppError(
      409,
      ERROR_CODE.BLOG_SLUG_ALREADY_EXISTS,
      ERROR_MESSAGE.BLOG_SLUG_ALREADY_EXISTS
    )
  }

  return slug
}

const ensureActiveBlogPost = (post: BlogPostRecord | null): BlogPostRecord => {
  if (!post) {
    throw new AppError(404, ERROR_CODE.BLOG_POST_NOT_FOUND, ERROR_MESSAGE.BLOG_POST_NOT_FOUND)
  }

  return post
}

const resolveThumbnailObjectKey = async (
  mediaRepository: MediaRepositoryPort,
  data: {
    actorId: string
    actorRole: 'admin' | 'teacher' | 'student'
    thumbnailMediaId?: string | null
  }
): Promise<string | null | undefined> => {
  if (data.thumbnailMediaId === undefined) {
    return undefined
  }
  if (data.thumbnailMediaId === null) {
    return null
  }
  const media = await mediaRepository.findMediaById(data.thumbnailMediaId)
  const thumbnailMedia = ensureMediaExists(media)
  validateImageMedia(
    { id: data.actorId, role: data.actorRole },
    thumbnailMedia,
    'Blog thumbnail media'
  )
  return thumbnailMedia.objectKey
}

const validateContentImages = async (
  mediaRepository: MediaRepositoryPort,
  content: unknown,
  actor: { id: string; role: 'admin' | 'teacher' | 'student' }
): Promise<string[]> => {
  const mediaIds = getRichContentMediaIds(content)
  for (const mediaId of mediaIds) {
    const media = ensureMediaExists(await mediaRepository.findMediaById(mediaId))
    validateImageMedia(actor, media, 'Blog content image')
  }
  return mediaIds
}

export class AdminBlogService {
  constructor(
    private readonly repository: BlogRepositoryPort,
    private readonly mediaRepository: MediaRepositoryPort
  ) {}

  async createPost(input: CreateBlogPostDto): Promise<AdminBlogPostResponse> {
    const slug = await createBlogPostSlug(this.repository, input.title)
    const rawContent = input.content ?? { type: 'doc', content: [] }
    const normalizedContent = normalizeRichContentHeadingIds(rawContent)
    if (input.categoryId) {
      const category = await this.repository.findCategoryById(input.categoryId)
      if (!category) {
        throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Blog category not found')
      }
    }
    const media = input.thumbnailMediaId
      ? await this.mediaRepository.findMediaById(input.thumbnailMediaId)
      : null
    const thumbnailMedia = input.thumbnailMediaId ? ensureMediaExists(media) : null
    const contentMediaIds = await validateContentImages(this.mediaRepository, normalizedContent, {
      id: input.authorId,
      role: input.actorRole
    })

    if (thumbnailMedia) {
      validateImageMedia(
        { id: input.authorId, role: input.actorRole },
        thumbnailMedia,
        'Blog thumbnail media'
      )
    }

    const post = await this.repository.createPost({
      ...input,
      slug,
      content: normalizedContent,
      contentMediaIds,
      thumbnailObjectKey: thumbnailMedia?.objectKey ?? null
    })

    return mapBlogPost(post)
  }

  async listPosts(input: ListAdminBlogPostsDto): Promise<ListAdminBlogPostsResponse> {
    const [items, totalItems] = await this.repository.listAdminPosts({
      filters: {
        status: input.status,
        authorId: input.actorRole === 'admin' ? input.authorId : input.actorId,
        categorySlug: input.categorySlug,
        isFeatured: input.isFeatured,
        tag: input.tag,
        search: input.search
      },
      page: input.page,
      limit: input.limit
    })

    return {
      items: items.map(mapBlogPostSummary),
      pagination: {
        page: input.page,
        limit: input.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / input.limit)
      }
    }
  }

  async listTags(input: ListAdminBlogTagsDto): Promise<ListAdminBlogTagsResponse> {
    const tagSources = await this.repository.listTagSources({
      publishedOnly: false,
      authorId: input.actorRole === 'admin' ? undefined : input.actorId
    })

    return {
      items: countTags(tagSources, input.limit)
    }
  }

  async listCategories(
    input: ListAdminBlogCategoriesDto
  ): Promise<ListAdminBlogCategoriesResponse> {
    const categories = await this.repository.listCategories({
      publishedOnly: false,
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

  async createCategory(input: CreateBlogCategoryDto) {
    const slug = input.slug ?? createSlugFromText(normalizeText(input.name))
    const existingCategory = await this.repository.findCategoryBySlug(slug)
    if (existingCategory) {
      throw new AppError(409, ERROR_CODE.CONFLICT, 'Blog category already exists')
    }

    return this.repository.createCategory({ name: input.name, slug })
  }

  async getPost(input: BlogPostIdDto): Promise<AdminBlogPostResponse> {
    const postRecord = await this.repository.findActivePostById(input.blogPostId)
    const post = ensureActiveBlogPost(postRecord)
    validateCanManagePost(post, input.actorId, input.actorRole)
    return mapBlogPost(post)
  }

  async updatePost(input: UpdateBlogPostDto): Promise<AdminBlogPostResponse> {
    const postRecord = await this.repository.findActivePostById(input.blogPostId)
    const post = ensureActiveBlogPost(postRecord)
    validateCanManagePost(post, input.actorId, input.actorRole)

    if (input.categoryId) {
      const category = await this.repository.findCategoryById(input.categoryId)
      if (!category) {
        throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Blog category not found')
      }
    }

    const thumbnailObjectKey = await resolveThumbnailObjectKey(this.mediaRepository, {
      actorId: input.actorId,
      actorRole: input.actorRole,
      thumbnailMediaId: input.thumbnailMediaId
    })
    const normalizedContent = input.content
      ? normalizeRichContentHeadingIds(input.content)
      : undefined
    const contentMediaIds = normalizedContent
      ? await validateContentImages(this.mediaRepository, normalizedContent, {
          id: input.actorId,
          role: input.actorRole
        })
      : undefined

    const updatedPost = await this.repository.updatePost({
      ...input,
      content: normalizedContent,
      contentMediaIds,
      thumbnailObjectKey
    })

    return mapBlogPost(updatedPost)
  }

  async publishPost(input: BlogPostIdDto): Promise<AdminBlogPostResponse> {
    const postRecord = await this.repository.findActivePostById(input.blogPostId)
    const post = ensureActiveBlogPost(postRecord)
    validateCanManagePost(post, input.actorId, input.actorRole)

    if (!post.title?.trim() || post.title.length < 2) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Invalid blog post title.')
    }
    if (!post.excerpt?.trim()) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Blog post excerpt is required for publishing.')
    }
    if (!post.categoryId) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Blog category is required for publishing.')
    }
    if (!post.thumbnailMediaId) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Blog post thumbnail is required for publishing.')
    }
    if (!post.tags || post.tags.length === 0) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'At least one blog tag is required for publishing.')
    }
    if (countRichContentWords(post.content) === 0) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Blog post content cannot be empty for publishing.')
    }

    const updatedPost = await this.repository.updateStatus({
      blogPostId: input.blogPostId,
      status: 'published',
      publishedAt: post.publishedAt ?? new Date()
    })

    return mapBlogPost(updatedPost)
  }

  async unpublishPost(input: BlogPostIdDto): Promise<AdminBlogPostResponse> {
    const postRecord = await this.repository.findActivePostById(input.blogPostId)
    const post = ensureActiveBlogPost(postRecord)
    validateCanManagePost(post, input.actorId, input.actorRole)

    const updatedPost = await this.repository.updateStatus({
      blogPostId: input.blogPostId,
      status: 'draft',
      publishedAt: null
    })

    return mapBlogPost(updatedPost)
  }

  async deletePost(input: BlogPostIdDto): Promise<{ id: string; deleted: true }> {
    const postRecord = await this.repository.findActivePostById(input.blogPostId)
    const post = ensureActiveBlogPost(postRecord)
    validateCanManagePost(post, input.actorId, input.actorRole)

    const deletedPost = await this.repository.softDeletePost(input.blogPostId)
    return {
      id: deletedPost.id,
      deleted: true
    }
  }
}
