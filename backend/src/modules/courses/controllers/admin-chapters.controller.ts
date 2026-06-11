import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type {
  CreateChapterDto,
  DeleteChapterDto,
  ReorderChaptersDto,
  UpdateChapterDto
} from '../dto'
import {
  type AdminChapterService,
  adminChapterService
} from '../services/admin-chapters.service'
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

export class AdminChapterController {
  constructor(private readonly service: AdminChapterService) {}

  createChapter = async (req: Request, res: Response) => {
    const validated = req.validated as CreateChapterValidated
    const dto: CreateChapterDto = {
      courseId: validated.params.courseId,
      ...validated.body
    }
    const data = await this.service.createChapter(req.user!, dto)

    sendSuccess({ res, data, status: 201 })
  }

  updateChapter = async (req: Request, res: Response) => {
    const validated = req.validated as UpdateChapterValidated
    const dto: UpdateChapterDto = {
      chapterId: validated.params.chapterId,
      ...validated.body
    }
    const data = await this.service.updateChapter(req.user!, dto)

    sendSuccess({ res, data })
  }

  deleteChapter = async (req: Request, res: Response) => {
    const validated = req.validated as DeleteChapterValidated
    const dto: DeleteChapterDto = {
      chapterId: validated.params.chapterId
    }
    const data = await this.service.deleteChapter(req.user!, dto)

    sendSuccess({ res, data })
  }

  reorderChapters = async (req: Request, res: Response) => {
    const validated = req.validated as ReorderChaptersValidated
    const dto: ReorderChaptersDto = {
      courseId: validated.params.courseId,
      ...validated.body
    }
    const data = await this.service.reorderChapters(req.user!, dto)

    sendSuccess({ res, data })
  }
}

export const adminChapterController = new AdminChapterController(adminChapterService)

export const createChapterController = adminChapterController.createChapter
export const updateChapterController = adminChapterController.updateChapter
export const deleteChapterController = adminChapterController.deleteChapter
export const reorderChaptersController = adminChapterController.reorderChapters
