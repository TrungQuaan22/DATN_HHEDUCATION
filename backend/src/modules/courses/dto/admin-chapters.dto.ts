import z from 'zod'

import {
  createChapterBodySchema,
  reorderChaptersBodySchema,
  updateChapterBodySchema
} from '../validators/admin-chapters.validator'

export type CreateChapterDto = z.infer<typeof createChapterBodySchema> & {
  courseId: string
}

export type UpdateChapterDto = z.infer<typeof updateChapterBodySchema> & {
  chapterId: string
}

export type DeleteChapterDto = {
  chapterId: string
}

export type ReorderChaptersDto = z.infer<typeof reorderChaptersBodySchema> & {
  courseId: string
}

export type AdminChapterResponseDto = {
  id: string
  courseId: string
  title: string
  orderIndex: number
  createdAt: Date
  updatedAt: Date
}

export type ReorderChaptersResponseDto = {
  courseId: string
  items: Array<{
    id: string
    orderIndex: number
  }>
}
