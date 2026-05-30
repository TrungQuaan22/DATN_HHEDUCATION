import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type { CompleteUploadDto, CreatePresignedUploadDto } from '../dto'
import { mediaUploadService } from '../services/upload.service'
import {
  completeUploadSchema,
  createPresignedUploadSchema
} from '../validators/upload.validator'

type CreatePresignedUploadValidated = z.infer<typeof createPresignedUploadSchema>
type CompleteUploadValidated = z.infer<typeof completeUploadSchema>

export class MediaUploadController {
  constructor(private readonly service = mediaUploadService) {}

  createUpload = async (req: Request, res: Response) => {
    const validated = req.validated as CreatePresignedUploadValidated
    const dto: CreatePresignedUploadDto = validated.body
    const data = await this.service.createUpload(req.user!, dto)

    sendSuccess({ res, data, status: 201 })
  }

  completeUpload = async (req: Request, res: Response) => {
    const validated = req.validated as CompleteUploadValidated
    const dto: CompleteUploadDto = validated.body
    const data = await this.service.completeUpload(req.user!, dto)

    sendSuccess({ res, data })
  }
}

export const mediaUploadController = new MediaUploadController(mediaUploadService)

export const createUploadController = mediaUploadController.createUpload
export const completeUploadController = mediaUploadController.completeUpload
