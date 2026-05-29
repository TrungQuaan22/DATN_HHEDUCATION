import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import { UserService, userService } from '../services/user.service'
import { updateMeSchema } from '../validators/user.validator'

type UpdateMeValidated = z.infer<typeof updateMeSchema>

export class UserController {
  constructor(private readonly service: UserService) {}

  getMe = async (req: Request, res: Response) => {
    const { id } = req.user!
    const data = await this.service.getMe(id)

    sendSuccess({ res, data })
  }

  updateMe = async (req: Request, res: Response) => {
    const validated = req.validated as UpdateMeValidated
    const data = await this.service.updateMe({
      userId: req.user!.id,
      ...validated.body
    })

    sendSuccess({ res, data })
  }
}

export const userController = new UserController(userService)

export const getMeController = userController.getMe
export const updateMeController = userController.updateMe
