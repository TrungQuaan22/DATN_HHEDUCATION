import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type { CreateTutorSessionDto, SendTutorMessageDto } from './dto/tutor.dto'
import { tutorService, type TutorService } from './service'
import {
  createTutorSessionSchema,
  listTutorSessionsSchema,
  sendTutorMessageSchema,
  tutorSessionIdSchema
} from './validators/tutor.validator'

type CreateTutorSessionValidated = z.infer<typeof createTutorSessionSchema>
type ListTutorSessionsValidated = z.infer<typeof listTutorSessionsSchema>
type TutorSessionIdValidated = z.infer<typeof tutorSessionIdSchema>
type SendTutorMessageValidated = z.infer<typeof sendTutorMessageSchema>

export class TutorController {
  constructor(private readonly service: TutorService) {}

  listSessions = async (req: Request, res: Response) => {
    const validated = req.validated as ListTutorSessionsValidated
    const data = await this.service.listSessions(
      req.user!.id,
      validated.query.courseId,
      validated.query.lessonId
    )

    sendSuccess({ res, data })
  }

  createSession = async (req: Request, res: Response) => {
    const validated = req.validated as CreateTutorSessionValidated
    const dto: CreateTutorSessionDto = validated.body
    const data = await this.service.createSession(req.user!.id, dto)

    sendSuccess({ res, data, status: 201 })
  }

  getSessionDetail = async (req: Request, res: Response) => {
    const validated = req.validated as TutorSessionIdValidated
    const data = await this.service.getSessionDetail(req.user!.id, validated.params.sessionId)

    sendSuccess({ res, data })
  }

  sendMessage = async (req: Request, res: Response) => {
    const validated = req.validated as SendTutorMessageValidated
    const dto: SendTutorMessageDto = {
      sessionId: validated.params.sessionId,
      ...validated.body
    }
    const data = await this.service.sendMessage(req.user!.id, dto)

    sendSuccess({ res, data })
  }

  sendMessageStream = async (req: Request, res: Response) => {
    const validated = req.validated as SendTutorMessageValidated
    const dto: SendTutorMessageDto = {
      sessionId: validated.params.sessionId,
      ...validated.body
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders?.()

    await this.service.sendMessageStream(req.user!.id, dto, res)
  }
}

export const tutorController = new TutorController(tutorService)

export const listTutorSessionsController = tutorController.listSessions
export const createTutorSessionController = tutorController.createSession
export const getTutorSessionDetailController = tutorController.getSessionDetail
export const sendTutorMessageController = tutorController.sendMessage
export const sendTutorMessageStreamController = tutorController.sendMessageStream
