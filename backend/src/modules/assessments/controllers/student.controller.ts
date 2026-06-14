import type { Request, Response } from 'express'
import type z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type { StudentAssessmentService } from '../services/student.service'
import { studentAssessmentService } from '../wiring'
import type {
  listStudentAssessmentsSchema,
  placementWorkspaceSchema,
  saveAnswersSchema,
  startAttemptSchema,
  submitAttemptSchema
} from '../validators/assessment.validator'

type ListStudentAssessmentsValidated = z.infer<typeof listStudentAssessmentsSchema>
type PlacementWorkspaceValidated = z.infer<typeof placementWorkspaceSchema>
type StartAttemptValidated = z.infer<typeof startAttemptSchema>
type SaveAnswersValidated = z.infer<typeof saveAnswersSchema>
type SubmitAttemptValidated = z.infer<typeof submitAttemptSchema>

export class StudentAssessmentController {
  constructor(private readonly service: StudentAssessmentService) {}

  listStudentAssessments = async (req: Request, res: Response) => {
    const validated = req.validated as ListStudentAssessmentsValidated
    const data = await this.service.listStudentAssessments({
      ...validated.query,
      userId: req.user!.id
    })

    sendSuccess({ res, data })
  }

  getAssessmentWorkspace = async (req: Request, res: Response) => {
    const validated = req.validated as PlacementWorkspaceValidated
    const data = await this.service.getAssessmentWorkspace({
      userId: req.user!.id,
      placementId: validated.params.placementId,
      submissionId: validated.query.submissionId
    })

    sendSuccess({ res, data })
  }

  startAttempt = async (req: Request, res: Response) => {
    const validated = req.validated as StartAttemptValidated
    const data = await this.service.startAttempt({
      userId: req.user!.id,
      placementId: validated.params.placementId
    })

    sendSuccess({ res, data, status: 201 })
  }

  saveAnswers = async (req: Request, res: Response) => {
    const validated = req.validated as SaveAnswersValidated
    const data = await this.service.saveAnswers({
      userId: req.user!.id,
      submissionId: validated.params.submissionId,
      answers: validated.body.answers
    })

    sendSuccess({ res, data })
  }

  submitAttempt = async (req: Request, res: Response) => {
    const validated = req.validated as SubmitAttemptValidated
    const data = await this.service.submitAttempt({
      userId: req.user!.id,
      submissionId: validated.params.submissionId
    })

    sendSuccess({ res, data })
  }
}

export const studentAssessmentController = new StudentAssessmentController(studentAssessmentService)

export const listStudentAssessmentsController = studentAssessmentController.listStudentAssessments
export const getAssessmentWorkspaceController = studentAssessmentController.getAssessmentWorkspace
export const startAttemptController = studentAssessmentController.startAttempt
export const saveAnswersController = studentAssessmentController.saveAnswers
export const submitAttemptController = studentAssessmentController.submitAttempt
