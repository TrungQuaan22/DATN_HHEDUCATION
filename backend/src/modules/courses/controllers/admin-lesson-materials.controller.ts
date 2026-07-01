import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type {
  CreateLessonMaterialDto,
  DeleteLessonMaterialDto,
  IngestLessonMaterialDto,
  UpdateLessonMaterialDto
} from '../dto'
import {
  type AdminLessonMaterialService,
  adminLessonMaterialService
} from '../services/admin-lesson-materials.service'
import {
  createLessonMaterialSchema,
  deleteLessonMaterialSchema,
  ingestLessonMaterialSchema,
  listLessonMaterialsSchema,
  updateLessonMaterialSchema
} from '../validators/admin-lesson-materials.validator'

type CreateLessonMaterialValidated = z.infer<typeof createLessonMaterialSchema>
type ListLessonMaterialsValidated = z.infer<typeof listLessonMaterialsSchema>
type UpdateLessonMaterialValidated = z.infer<typeof updateLessonMaterialSchema>
type DeleteLessonMaterialValidated = z.infer<typeof deleteLessonMaterialSchema>
type IngestLessonMaterialValidated = z.infer<typeof ingestLessonMaterialSchema>

export class AdminLessonMaterialController {
  constructor(private readonly service: AdminLessonMaterialService) {}

  createLessonMaterial = async (req: Request, res: Response) => {
    const validated = req.validated as CreateLessonMaterialValidated
    const dto: CreateLessonMaterialDto = {
      lessonId: validated.params.lessonId,
      ...validated.body
    }
    const data = await this.service.createLessonMaterial(req.user!, dto)

    sendSuccess({ res, data, status: 201 })
  }

  listLessonMaterials = async (req: Request, res: Response) => {
    const validated = req.validated as ListLessonMaterialsValidated
    const data = await this.service.listLessonMaterials(req.user!, validated.params.lessonId)

    sendSuccess({ res, data })
  }

  updateLessonMaterial = async (req: Request, res: Response) => {
    const validated = req.validated as UpdateLessonMaterialValidated
    const dto: UpdateLessonMaterialDto = {
      materialId: validated.params.materialId,
      ...validated.body
    }
    const data = await this.service.updateLessonMaterial(req.user!, dto)

    sendSuccess({ res, data })
  }

  deleteLessonMaterial = async (req: Request, res: Response) => {
    const validated = req.validated as DeleteLessonMaterialValidated
    const dto: DeleteLessonMaterialDto = {
      materialId: validated.params.materialId
    }
    const data = await this.service.deleteLessonMaterial(req.user!, dto)

    sendSuccess({ res, data })
  }

  ingestLessonMaterial = async (req: Request, res: Response) => {
    const validated = req.validated as IngestLessonMaterialValidated
    const dto: IngestLessonMaterialDto = {
      materialId: validated.params.materialId
    }
    const data = await this.service.ingestLessonMaterial(req.user!, dto)

    sendSuccess({ res, data })
  }
}

export const adminLessonMaterialController = new AdminLessonMaterialController(
  adminLessonMaterialService
)

export const createLessonMaterialController =
  adminLessonMaterialController.createLessonMaterial
export const listLessonMaterialsController = adminLessonMaterialController.listLessonMaterials
export const updateLessonMaterialController =
  adminLessonMaterialController.updateLessonMaterial
export const deleteLessonMaterialController =
  adminLessonMaterialController.deleteLessonMaterial
export const ingestLessonMaterialController =
  adminLessonMaterialController.ingestLessonMaterial
