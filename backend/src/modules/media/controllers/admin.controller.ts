import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type { CompleteUploadDto, CreatePresignedUploadDto } from '../dto/admin.dto'
import { mediaUploadService } from '../wiring'
import { completeUploadSchema, createPresignedUploadSchema } from '../validators/admin.validator'

type CreatePresignedUploadValidated = z.infer<typeof createPresignedUploadSchema>
type CompleteUploadValidated = z.infer<typeof completeUploadSchema>

export const createPresignedUploadController = async (req: Request, res: Response) => {
  const validated = req.validated as CreatePresignedUploadValidated
  const dto: CreatePresignedUploadDto = validated.body
  const data = await mediaUploadService.createUpload(req.user!, dto)

  sendSuccess({ res, data, status: 201 })
}

export const completeUploadController = async (req: Request, res: Response) => {
  const validated = req.validated as CompleteUploadValidated
  const dto: CompleteUploadDto = validated.body
  const data = await mediaUploadService.completeUpload(req.user!, dto)

  sendSuccess({ res, data })
}
