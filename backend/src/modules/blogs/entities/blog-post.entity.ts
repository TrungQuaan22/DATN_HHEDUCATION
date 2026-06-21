import { BlogPostStatus, UserRole, type Prisma } from '@prisma/client'
import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { createSlugFromText } from '~/common/utils/slug'
import { normalizeText } from '~/common/utils/search'
import { getReadingMinutes } from '../utils'
import type { BlogPostRecord, BlogAuthorRecord } from '../ports/blog-repository.port'

export class BlogPost implements BlogPostRecord {
  readonly id: string
  readonly title: string
  readonly slug: string
  readonly excerpt: string
  readonly category: string | null
  readonly tags: string[]
  readonly content: Prisma.JsonValue
  readonly thumbnailMediaId: string | null
  readonly thumbnailObjectKey: string | null
  readonly authorId: string
  readonly author: BlogAuthorRecord
  readonly status: BlogPostStatus
  readonly isFeatured: boolean
  readonly publishedAt: Date | null
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(record: BlogPostRecord) {
    this.id = record.id
    this.title = record.title
    this.slug = record.slug
    this.excerpt = record.excerpt
    this.category = record.category
    this.tags = record.tags
    this.content = record.content
    this.thumbnailMediaId = record.thumbnailMediaId
    this.thumbnailObjectKey = record.thumbnailObjectKey
    this.authorId = record.authorId
    this.author = record.author
    this.status = record.status
    this.isFeatured = record.isFeatured
    this.publishedAt = record.publishedAt
    this.createdAt = record.createdAt
    this.updatedAt = record.updatedAt
  }

  // --- Domain Logic & Calculations ---

  getReadingMinutes(): number {
    return getReadingMinutes(this.content)
  }

  canManage(actorId: string, actorRole: UserRole): boolean {
    return actorRole === UserRole.admin || this.authorId === actorId
  }

  ensureCanManage(actorId: string, actorRole: UserRole): void {
    if (!this.canManage(actorId, actorRole)) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, ERROR_MESSAGE.FORBIDDEN)
    }
  }

  static calculateSlug(title: string, explicitSlug?: string): string {
    return explicitSlug ?? createSlugFromText(normalizeText(title))
  }
}
