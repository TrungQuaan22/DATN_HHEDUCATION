import type { Request, Response } from 'express'
import type z from 'zod'

import { sendSuccess } from '~/common/http/response'

import {
  publicAssessmentService,
  type PublicAssessmentService
} from '../services/public.service'
import type {
  listPublicPlacementsSchema,
  placementIdSchema,
  placementSlugSchema
} from '../validators/assessment.validator'

type ListPublicPlacementsValidated = z.infer<typeof listPublicPlacementsSchema>
type PlacementIdValidated = z.infer<typeof placementIdSchema>
type PlacementSlugValidated = z.infer<typeof placementSlugSchema>

export class PublicAssessmentController {
  constructor(private readonly service: PublicAssessmentService) {}

  listPublicPlacements = async (req: Request, res: Response) => {
    const validated = req.validated as ListPublicPlacementsValidated
    const data = await this.service.listPublicPlacements(validated.query)

    sendSuccess({ res, data })
  }

  getRuntimeAssessment = async (req: Request, res: Response) => {
    const validated = req.validated as PlacementIdValidated
    const data = await this.service.getRuntimeAssessment({
      userId: req.user?.id,
      placementId: validated.params.placementId
    })

    sendSuccess({ res, data })
  }

  getRuntimeAssessmentBySlug = async (req: Request, res: Response) => {
    const validated = req.validated as PlacementSlugValidated
    const data = await this.service.getRuntimeAssessmentBySlug({
      userId: req.user?.id,
      slug: validated.params.slug
    })

    sendSuccess({ res, data })
  }
}

export const publicAssessmentController = new PublicAssessmentController(publicAssessmentService)

export const listPublicPlacementsController = publicAssessmentController.listPublicPlacements
export const getRuntimeAssessmentController = publicAssessmentController.getRuntimeAssessment
export const getRuntimeAssessmentBySlugController = publicAssessmentController.getRuntimeAssessmentBySlug
