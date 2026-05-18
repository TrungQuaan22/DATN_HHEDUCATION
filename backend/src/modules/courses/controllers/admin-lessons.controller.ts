import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type {
  CreateLessonDto,
  DeleteLessonDto,
  ReorderLessonsDto,
  UpdateLessonDto
} from '../dto/admin-lessons.dto'
import { adminLessonService } from '../services/admin-lessons.service'
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

export const createLessonController = async (req: Request, res: Response) => {
  const validated = req.validated as CreateLessonValidated
  const dto: CreateLessonDto = {
    chapterId: validated.params.chapterId,
    ...validated.body
  }
  const data = await adminLessonService.createLesson(req.user!, dto)

  sendSuccess({ res, data, status: 201 })
}

export const updateLessonController = async (req: Request, res: Response) => {
  const validated = req.validated as UpdateLessonValidated
  const dto: UpdateLessonDto = {
    lessonId: validated.params.lessonId,
    ...validated.body
  }
  const data = await adminLessonService.updateLesson(req.user!, dto)

  sendSuccess({ res, data })
}

export const deleteLessonController = async (req: Request, res: Response) => {
  const validated = req.validated as DeleteLessonValidated
  const dto: DeleteLessonDto = {
    lessonId: validated.params.lessonId
  }
  const data = await adminLessonService.deleteLesson(req.user!, dto)

  sendSuccess({ res, data })
}

export const reorderLessonsController = async (req: Request, res: Response) => {
  const validated = req.validated as ReorderLessonsValidated
  const dto: ReorderLessonsDto = {
    chapterId: validated.params.chapterId,
    ...validated.body
  }
  const data = await adminLessonService.reorderLessons(req.user!, dto)

  sendSuccess({ res, data })
}
