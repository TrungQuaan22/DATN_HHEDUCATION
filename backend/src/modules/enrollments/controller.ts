import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type { CreateManualEnrollmentDto } from './dto'
import { EnrollmentService, enrollmentService } from './service'
import { createManualEnrollmentSchema } from './validators'

type CreateManualEnrollmentValidated = z.infer<typeof createManualEnrollmentSchema>

export class EnrollmentController {
  constructor(private readonly service: EnrollmentService) {}

  createManualEnrollment = async (req: Request, res: Response) => {
    const validated = req.validated as CreateManualEnrollmentValidated
    const dto: CreateManualEnrollmentDto = validated.body
    const data = await this.service.createManualEnrollment(dto)

    sendSuccess({ res, data, status: 201 })
  }
}

export const enrollmentController = new EnrollmentController(enrollmentService)

export const createManualEnrollmentController = enrollmentController.createManualEnrollment
