import type { Request, Response } from 'express'
import type z from 'zod'

import { sendSuccess } from '~/common/http/response'

import { notificationService, type NotificationService } from './service'
import type { listNotificationsSchema, notificationIdSchema } from './validator'

type ListValidated = z.infer<typeof listNotificationsSchema>
type NotificationIdValidated = z.infer<typeof notificationIdSchema>

export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  list = async (req: Request, res: Response) => {
    const validated = req.validated as ListValidated
    sendSuccess({
      res,
      data: await this.service.list({ userId: req.user!.id, ...validated.query })
    })
  }

  unreadCount = async (req: Request, res: Response) => {
    sendSuccess({ res, data: await this.service.getUnreadCount(req.user!.id) })
  }

  markRead = async (req: Request, res: Response) => {
    const validated = req.validated as NotificationIdValidated
    sendSuccess({
      res,
      data: await this.service.markRead(req.user!.id, validated.params.notificationId)
    })
  }

  markAllRead = async (req: Request, res: Response) => {
    sendSuccess({ res, data: await this.service.markAllRead(req.user!.id) })
  }
}

const controller = new NotificationController(notificationService)
export const listNotificationsController = controller.list
export const getUnreadNotificationCountController = controller.unreadCount
export const markNotificationReadController = controller.markRead
export const markAllNotificationsReadController = controller.markAllRead
