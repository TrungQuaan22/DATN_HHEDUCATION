import type { CourseStatus, UserRole } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'

export type CourseActor = {
  id: string
  role: UserRole
}

type CourseAccess = {
  status: CourseStatus
  teacherId?: string
  deletedAt?: Date | null
}

export function validateCourseCanManage(course: CourseAccess, actor: CourseActor): void {
  if (course.deletedAt) {
    throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
  }

  const canManage = actor.role === 'admin' || (actor.role === 'teacher' && course.teacherId === actor.id)

  if (!canManage) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, ERROR_MESSAGE.FORBIDDEN)
  }
}

export function validateCourseCanBeEdited(course: { status: CourseStatus }): void {
  if (course.status === 'archived') {
    throw new AppError(400, ERROR_CODE.INVALID_COURSE_STATUS, ERROR_MESSAGE.INVALID_COURSE_STATUS)
  }
}

export function validateCourseIsPublished(course: { status: CourseStatus }): void {
  if (course.status !== 'published') {
    throw new AppError(400, ERROR_CODE.INVALID_COURSE_STATUS, ERROR_MESSAGE.INVALID_COURSE_STATUS)
  }
}

export function validateCourseCanBeReordered(course: { status: CourseStatus }): void {
  if (course.status !== 'draft') {
    throw new AppError(400, ERROR_CODE.INVALID_COURSE_STATUS, ERROR_MESSAGE.INVALID_COURSE_STATUS)
  }
}

export function validateCoursePrice(price: number, salePrice: number | null): void {
  const validSalePrice =
    price === 0 ? salePrice === null || salePrice === 0 : salePrice === null || salePrice < price

  if (!validSalePrice) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Sale price must be lower than course price')
  }
}

export function validateReorderIds(expectedIds: string[], receivedIds: string[]): void {
  const uniqueReceivedIds = [...new Set(receivedIds)]
  const expectedSortedIds = [...expectedIds].sort()
  const receivedSortedIds = [...uniqueReceivedIds].sort()
  const hasSameLength = expectedIds.length === uniqueReceivedIds.length
  const hasSameIds = expectedSortedIds.every((id, index) => id === receivedSortedIds[index])

  if (!hasSameLength || !hasSameIds) {
    throw new AppError(
      400,
      ERROR_CODE.INVALID_REORDER_PAYLOAD,
      ERROR_MESSAGE.INVALID_REORDER_PAYLOAD
    )
  }
}
