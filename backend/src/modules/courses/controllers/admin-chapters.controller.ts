import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type {
  CreateChapterDto,
  DeleteChapterDto,
  ReorderChaptersDto,
  UpdateChapterDto
} from '../dto/admin-chapters.dto'
import { adminChapterService } from '../services/admin-chapters.service'
import {
  createChapterSchema,
  deleteChapterSchema,
  reorderChaptersSchema,
  updateChapterSchema
} from '../validators/admin-chapters.validator'

type CreateChapterValidated = z.infer<typeof createChapterSchema>
type UpdateChapterValidated = z.infer<typeof updateChapterSchema>
type DeleteChapterValidated = z.infer<typeof deleteChapterSchema>
type ReorderChaptersValidated = z.infer<typeof reorderChaptersSchema>

export const createChapterController = async (req: Request, res: Response) => {
  const validated = req.validated as CreateChapterValidated
  const dto: CreateChapterDto = {
    courseId: validated.params.courseId,
    ...validated.body
  }
  const data = await adminChapterService.createChapter(req.user!, dto)

  sendSuccess({ res, data, status: 201 })
}

export const updateChapterController = async (req: Request, res: Response) => {
  const validated = req.validated as UpdateChapterValidated
  const dto: UpdateChapterDto = {
    chapterId: validated.params.chapterId,
    ...validated.body
  }
  const data = await adminChapterService.updateChapter(req.user!, dto)

  sendSuccess({ res, data })
}

export const deleteChapterController = async (req: Request, res: Response) => {
  const validated = req.validated as DeleteChapterValidated
  const dto: DeleteChapterDto = {
    chapterId: validated.params.chapterId
  }
  const data = await adminChapterService.deleteChapter(req.user!, dto)

  sendSuccess({ res, data })
}

export const reorderChaptersController = async (req: Request, res: Response) => {
  const validated = req.validated as ReorderChaptersValidated
  const dto: ReorderChaptersDto = {
    courseId: validated.params.courseId,
    ...validated.body
  }
  const data = await adminChapterService.reorderChapters(req.user!, dto)

  sendSuccess({ res, data })
}
