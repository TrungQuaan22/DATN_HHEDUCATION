import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type {
  CreateLessonDto,
  DeleteLessonDto,
  ReorderLessonsDto,
  UpdateLessonDto
} from '../dto'
import {
  type AdminLessonService,
  adminLessonService
} from '../services/admin-lessons.service'
import {
  createLessonSchema,
  deleteLessonSchema,
  reorderLessonsSchema,
  updateLessonSchema
} from '../validators/admin-lessons.validator'

type CreateLessonValidated = z.infer<typeof createLessonSchema>
type UpdateLessonValidated = z.infer<typeof updateLessonSchema>
type DeleteLessonValidated = z.infer<typeof deleteLessonSchema>
type ReorderLessonsValidated = z.infer<typeof reorderLessonsSchema>

export class AdminLessonController {
  constructor(private readonly service: AdminLessonService) {}

  createLesson = async (req: Request, res: Response) => {
    const validated = req.validated as CreateLessonValidated
    const dto: CreateLessonDto = {
      chapterId: validated.params.chapterId,
      ...validated.body
    }
    const data = await this.service.createLesson(req.user!, dto)

    sendSuccess({ res, data, status: 201 })
  }

  updateLesson = async (req: Request, res: Response) => {
    const validated = req.validated as UpdateLessonValidated
    const dto: UpdateLessonDto = {
      lessonId: validated.params.lessonId,
      ...validated.body
    }
    const data = await this.service.updateLesson(req.user!, dto)

    sendSuccess({ res, data })
  }

  deleteLesson = async (req: Request, res: Response) => {
    const validated = req.validated as DeleteLessonValidated
    const dto: DeleteLessonDto = {
      lessonId: validated.params.lessonId
    }
    const data = await this.service.deleteLesson(req.user!, dto)

    sendSuccess({ res, data })
  }

  reorderLessons = async (req: Request, res: Response) => {
    const validated = req.validated as ReorderLessonsValidated
    const dto: ReorderLessonsDto = {
      chapterId: validated.params.chapterId,
      ...validated.body
    }
    const data = await this.service.reorderLessons(req.user!, dto)

    sendSuccess({ res, data })
  }
}

export const adminLessonController = new AdminLessonController(adminLessonService)

export const createLessonController = adminLessonController.createLesson
export const updateLessonController = adminLessonController.updateLesson
export const deleteLessonController = adminLessonController.deleteLesson
export const reorderLessonsController = adminLessonController.reorderLessons
