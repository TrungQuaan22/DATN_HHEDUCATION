import type { UserRole } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'

import type { BlogPostRecord } from '../ports/blog-repository.port'

export function validateCanManagePost(
  post: BlogPostRecord,
  actorId: string,
  actorRole: UserRole
): void {
  const canManage = actorRole === 'admin' || post.authorId === actorId

  if (!canManage) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, ERROR_MESSAGE.FORBIDDEN)
  }
}
