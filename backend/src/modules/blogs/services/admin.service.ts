import { BlogPostStatus, UserRole, type Prisma } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { ensureActorCanUseImageMedia } from '~/common/ensures/media.ensure'
import { applySearchCondition, normalizeText } from '~/common/utils/search'
import { createSlugFromText } from '~/common/utils/slug'

import type {
  AdminBlogPostDto,
  AdminBlogPostSummaryDto,
  BlogPostIdDto,
  CreateBlogPostDto,
  ListAdminBlogCategoriesDto,
  ListAdminBlogCategoriesResponseDto,
  ListAdminBlogTagsDto,
  ListAdminBlogTagsResponseDto,
  ListAdminBlogPostsDto,
  ListAdminBlogPostsResponseDto,
  UpdateBlogPostDto
} from '../dto/admin.dto'
import { blogRepository } from '../repository'
import { mapBlogPostMedia } from '../mappers/blog.mapper'
import { createExcerptFromContent, getReadingMinutes } from '../utils/rich-content'

type BlogPostWithAuthor = NonNullable<Awaited<ReturnType<typeof blogRepository.findActivePostById>>>

const canManagePost = ({
  post,
  actorId,
  actorRole
}: {
  post: BlogPostWithAuthor
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
  post: BlogPostWithAuthor
  actorId: string
  actorRole: UserRole
}) => {
  if (!canManagePost({ post, actorId, actorRole })) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, ERROR_MESSAGE.FORBIDDEN)
  }
}

const mapBlogPost = (post: BlogPostWithAuthor): AdminBlogPostDto => {
  const mappedPost = mapBlogPostMedia({
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    tags: post.tags,
    thumbnailMediaId: post.thumbnailMediaId,
    thumbnailObjectKey: post.thumbnailObjectKey,
    author: post.author,
    status: post.status,
    isFeatured: post.isFeatured,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  })

  return {
    ...mappedPost,
    excerpt: post.excerpt ?? createExcerptFromContent(post.content),
    content: post.content,
    readingMinutes: getReadingMinutes(post.content)
  }
}

const mapBlogPostSummary = (post: BlogPostWithAuthor): AdminBlogPostSummaryDto => {
  const { content, ...summary } = mapBlogPost(post)
  void content
  return summary
}

const createBlogPostSlug = async (title: string, explicitSlug?: string): Promise<string> => {
  const slug = explicitSlug ?? createSlugFromText(normalizeText(title))
  const existedPost = await blogRepository.findActivePostBySlug(slug)

  if (existedPost) {
    throw new AppError(
      409,
      ERROR_CODE.BLOG_SLUG_ALREADY_EXISTS,
      ERROR_MESSAGE.BLOG_SLUG_ALREADY_EXISTS
    )
  }

  return slug
}

const ensureActiveBlogPost = async (blogPostId: string): Promise<BlogPostWithAuthor> => {
  const post = await blogRepository.findActivePostById(blogPostId)

  if (!post) {
    throw new AppError(404, ERROR_CODE.BLOG_POST_NOT_FOUND, ERROR_MESSAGE.BLOG_POST_NOT_FOUND)
  }

  return post
}

const countTags = (tagSources: Array<{ tags: string[] }>, limit: number) => {
  const counts = new Map<string, number>()

  for (const post of tagSources) {
    for (const rawTag of post.tags) {
      const tag = rawTag.trim()
      if (!tag) continue
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'vi'))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

const countCategories = (categorySources: Array<{ category: string | null }>, limit: number) => {
  const counts = new Map<string, number>()

  for (const post of categorySources) {
    const category = post.category?.trim()
    if (!category) continue
    counts.set(category, (counts.get(category) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'vi'))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

export const adminBlogService = {
  async createPost(input: CreateBlogPostDto): Promise<AdminBlogPostDto> {
    const slug = await createBlogPostSlug(input.title, input.slug)
    const thumbnailMedia = input.thumbnailMediaId
      ? await ensureActorCanUseImageMedia({
          actor: { id: input.authorId, role: input.actorRole },
          mediaId: input.thumbnailMediaId,
          label: 'Blog thumbnail media'
        })
      : null

    const post = await blogRepository.createPost({
      ...input,
      slug,
      content: input.content as Prisma.InputJsonValue,
      thumbnailObjectKey: thumbnailMedia?.objectKey ?? null
    })

    return mapBlogPost(post)
  },

  async listPosts(input: ListAdminBlogPostsDto): Promise<ListAdminBlogPostsResponseDto> {
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
      titleField: 'title',
      slugField: 'slug'
    })

    const skip = (input.page - 1) * input.limit
    const [items, totalItems] = await blogRepository.listAdminPosts({
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
  },

  async listTags(input: ListAdminBlogTagsDto): Promise<ListAdminBlogTagsResponseDto> {
    const tagSources = await blogRepository.listTagSources({
      deletedAt: null,
      authorId: input.actorRole === UserRole.admin ? undefined : input.actorId
    })

    return {
      items: countTags(tagSources, input.limit)
    }
  },

  async listCategories(
    input: ListAdminBlogCategoriesDto
  ): Promise<ListAdminBlogCategoriesResponseDto> {
    const categorySources = await blogRepository.listCategorySources({
      deletedAt: null,
      authorId: input.actorRole === UserRole.admin ? undefined : input.actorId
    })

    return {
      items: countCategories(categorySources, input.limit)
    }
  },

  async getPost(input: BlogPostIdDto): Promise<AdminBlogPostDto> {
    const post = await ensureActiveBlogPost(input.blogPostId)
    ensureCanManagePost({ post, actorId: input.actorId, actorRole: input.actorRole })
    return mapBlogPost(post)
  },

  async updatePost(input: UpdateBlogPostDto): Promise<AdminBlogPostDto> {
    const post = await ensureActiveBlogPost(input.blogPostId)
    ensureCanManagePost({ post, actorId: input.actorId, actorRole: input.actorRole })

    if (input.slug && input.slug !== post.slug) {
      await createBlogPostSlug(input.title ?? post.title, input.slug)
    }

    const thumbnailMedia = input.thumbnailMediaId
      ? await ensureActorCanUseImageMedia({
          actor: { id: input.actorId, role: input.actorRole },
          mediaId: input.thumbnailMediaId,
          label: 'Blog thumbnail media'
        })
      : null

    const updatedPost = await blogRepository.updatePost({
      ...input,
      content: input.content as Prisma.InputJsonValue | undefined,
      thumbnailObjectKey:
        input.thumbnailMediaId === undefined ? undefined : thumbnailMedia?.objectKey ?? null
    })

    return mapBlogPost(updatedPost)
  },

  async publishPost(input: BlogPostIdDto): Promise<AdminBlogPostDto> {
    const post = await ensureActiveBlogPost(input.blogPostId)
    ensureCanManagePost({ post, actorId: input.actorId, actorRole: input.actorRole })

    const updatedPost = await blogRepository.updateStatus({
      blogPostId: input.blogPostId,
      status: BlogPostStatus.published,
      publishedAt: post.publishedAt ?? new Date()
    })

    return mapBlogPost(updatedPost)
  },

  async unpublishPost(input: BlogPostIdDto): Promise<AdminBlogPostDto> {
    const post = await ensureActiveBlogPost(input.blogPostId)
    ensureCanManagePost({ post, actorId: input.actorId, actorRole: input.actorRole })

    const updatedPost = await blogRepository.updateStatus({
      blogPostId: input.blogPostId,
      status: BlogPostStatus.draft,
      publishedAt: null
    })

    return mapBlogPost(updatedPost)
  },

  async deletePost(input: BlogPostIdDto): Promise<{ id: string; deleted: true }> {
    const post = await ensureActiveBlogPost(input.blogPostId)
    ensureCanManagePost({ post, actorId: input.actorId, actorRole: input.actorRole })

    const deletedPost = await blogRepository.softDeletePost(input.blogPostId)
    return {
      id: deletedPost.id,
      deleted: true
    }
  }
}
