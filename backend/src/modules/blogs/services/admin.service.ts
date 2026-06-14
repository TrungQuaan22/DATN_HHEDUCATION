import { BlogPostStatus, UserRole, type Prisma } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { ensureActorCanUseImageMedia } from '~/common/ensures/media.ensure'
import { AppError } from '~/common/error/app-error'
import { mediaRepository } from '~/modules/media/repository'
import type { MediaRepositoryPort } from '~/modules/media/ports/media-repository.port'
import { applySearchCondition, normalizeText } from '~/common/utils/search'
import { createSlugFromText } from '~/common/utils/slug'

import type {
  AdminBlogPostResponse,
  AdminBlogPostSummaryResponse,
  BlogPostIdDto,
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
import { blogRepository } from '../repository'
import { countCategories, countTags, getReadingMinutes } from '../utils'

const canManagePost = ({
  post,
  actorId,
  actorRole
}: {
  post: BlogPostRecord
  actorId: string
  actorRole: UserRole
}): boolean => {
  return actorRole === UserRole.admin || post.authorId === actorId
}

const ensureCanManagePost = ({
  post,
  actorId,
  actorRole
}: {
  post: BlogPostRecord
  actorId: string
  actorRole: UserRole
}) => {
  if (!canManagePost({ post, actorId, actorRole })) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, ERROR_MESSAGE.FORBIDDEN)
  }
}

const mapBlogPost = (post: BlogPostRecord): AdminBlogPostResponse => {
  const readingMinutes = getReadingMinutes(post.content)
  return mapAdminBlogPostResponse(post, readingMinutes)
}

const mapBlogPostSummary = (post: BlogPostRecord): AdminBlogPostSummaryResponse => {
  const readingMinutes = getReadingMinutes(post.content)
  return mapAdminBlogPostSummaryResponse(post, readingMinutes)
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
    actorRole: UserRole
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
  const thumbnailMedia = ensureActorCanUseImageMedia({
    actor: { id: data.actorId, role: data.actorRole },
    media,
    label: 'Blog thumbnail media'
  })
  return thumbnailMedia?.objectKey ?? null
}

export class AdminBlogService {
  constructor(
    private readonly repository: BlogRepositoryPort,
    private readonly mediaRepository: MediaRepositoryPort
  ) {}

  async createPost(input: CreateBlogPostDto): Promise<AdminBlogPostResponse> {
    const slug = await createBlogPostSlug(this.repository, input.title, input.slug)
    const media = input.thumbnailMediaId
      ? await this.mediaRepository.findMediaById(input.thumbnailMediaId)
      : null
    const thumbnailMedia = input.thumbnailMediaId
      ? ensureActorCanUseImageMedia({
          actor: { id: input.authorId, role: input.actorRole },
          media,
          label: 'Blog thumbnail media'
        })
      : null

    const post = await this.repository.createPost({
      ...input,
      slug,
      content: input.content as Prisma.InputJsonValue,
      thumbnailObjectKey: thumbnailMedia?.objectKey ?? null
    })

    return mapBlogPost(post)
  }

  async listPosts(input: ListAdminBlogPostsDto): Promise<ListAdminBlogPostsResponse> {
    let where: Prisma.BlogPostWhereInput = {
      deletedAt: null,
      status: input.status,
      authorId: input.actorRole === UserRole.admin ? input.authorId : input.actorId,
      category: input.category,
      isFeatured: input.isFeatured,
      tags: input.tag ? { has: input.tag } : undefined
    }

    where = applySearchCondition({
      where,
      search: input.search,
      field: 'title',
      tokenField: 'slug'
    })

    const skip = (input.page - 1) * input.limit
    const [items, totalItems] = await this.repository.listAdminPosts({
      where,
      skip,
      take: input.limit
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
      deletedAt: null,
      authorId: input.actorRole === UserRole.admin ? undefined : input.actorId
    })

    return {
      items: countTags(tagSources, input.limit)
    }
  }

  async listCategories(
    input: ListAdminBlogCategoriesDto
  ): Promise<ListAdminBlogCategoriesResponse> {
    const categorySources = await this.repository.listCategorySources({
      deletedAt: null,
      authorId: input.actorRole === UserRole.admin ? undefined : input.actorId
    })

    return {
      items: countCategories(categorySources, input.limit)
    }
  }

  async getPost(input: BlogPostIdDto): Promise<AdminBlogPostResponse> {
    const postRecord = await this.repository.findActivePostById(input.blogPostId)
    const post = ensureActiveBlogPost(postRecord)
    ensureCanManagePost({ post, actorId: input.actorId, actorRole: input.actorRole })
    return mapBlogPost(post)
  }

  async updatePost(input: UpdateBlogPostDto): Promise<AdminBlogPostResponse> {
    const postRecord = await this.repository.findActivePostById(input.blogPostId)
    const post = ensureActiveBlogPost(postRecord)
    ensureCanManagePost({ post, actorId: input.actorId, actorRole: input.actorRole })

    if (input.slug && input.slug !== post.slug) {
      await createBlogPostSlug(this.repository, input.title ?? post.title, input.slug)
    }

    const thumbnailObjectKey = await resolveThumbnailObjectKey(this.mediaRepository, {
      actorId: input.actorId,
      actorRole: input.actorRole,
      thumbnailMediaId: input.thumbnailMediaId
    })

    const updatedPost = await this.repository.updatePost({
      ...input,
      content: input.content as Prisma.InputJsonValue | undefined,
      thumbnailObjectKey
    })

    return mapBlogPost(updatedPost)
  }

  async publishPost(input: BlogPostIdDto): Promise<AdminBlogPostResponse> {
    const postRecord = await this.repository.findActivePostById(input.blogPostId)
    const post = ensureActiveBlogPost(postRecord)
    ensureCanManagePost({ post, actorId: input.actorId, actorRole: input.actorRole })

    const updatedPost = await this.repository.updateStatus({
      blogPostId: input.blogPostId,
      status: BlogPostStatus.published,
      publishedAt: post.publishedAt ?? new Date()
    })

    return mapBlogPost(updatedPost)
  }

  async unpublishPost(input: BlogPostIdDto): Promise<AdminBlogPostResponse> {
    const postRecord = await this.repository.findActivePostById(input.blogPostId)
    const post = ensureActiveBlogPost(postRecord)
    ensureCanManagePost({ post, actorId: input.actorId, actorRole: input.actorRole })

    const updatedPost = await this.repository.updateStatus({
      blogPostId: input.blogPostId,
      status: BlogPostStatus.draft,
      publishedAt: null
    })

    return mapBlogPost(updatedPost)
  }

  async deletePost(input: BlogPostIdDto): Promise<{ id: string; deleted: true }> {
    const postRecord = await this.repository.findActivePostById(input.blogPostId)
    const post = ensureActiveBlogPost(postRecord)
    ensureCanManagePost({ post, actorId: input.actorId, actorRole: input.actorRole })

    const deletedPost = await this.repository.softDeletePost(input.blogPostId)
    return {
      id: deletedPost.id,
      deleted: true
    }
  }
}

export const adminBlogService = new AdminBlogService(blogRepository, mediaRepository)
