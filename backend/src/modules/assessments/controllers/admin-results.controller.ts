import type { Request, Response } from 'express'
import type z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type { AdminAssessmentResultService } from '../services/admin-results.service'
import type {
  getAssessmentStudentAttemptsSchema,
  listAssessmentResultsSchema
} from '../validators/admin-assessment-results.validator'
import { adminAssessmentResultService } from '../wiring'

type ListResultsValidated = z.infer<typeof listAssessmentResultsSchema>
type StudentAttemptsValidated = z.infer<typeof getAssessmentStudentAttemptsSchema>

export class AdminAssessmentResultController {
  constructor(private readonly service: AdminAssessmentResultService) {}

  listResults = async (req: Request, res: Response) => {
    const validated = req.validated as ListResultsValidated
    const data = await this.service.listResults({
      actor: req.user!,
      assessmentId: validated.params.assessmentId,
      ...validated.query
    })
    sendSuccess({ res, data })
  }

  getStudentAttempts = async (req: Request, res: Response) => {
    const validated = req.validated as StudentAttemptsValidated
    const data = await this.service.getStudentAttempts({
      actor: req.user!,
      assessmentId: validated.params.assessmentId,
      studentId: validated.params.studentId
    })
    sendSuccess({ res, data })
  }
}

const controller = new AdminAssessmentResultController(adminAssessmentResultService)
export const listAssessmentResultsController = controller.listResults
export const getAssessmentStudentAttemptsController = controller.getStudentAttempts
