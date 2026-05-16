import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import { userService } from '../services/user.service'
import { updateMeSchema } from '../validators/user.validator'

type UpdateMeValidated = z.infer<typeof updateMeSchema>

export const getMeController = async (req: Request, res: Response) => {
  const { id } = req.user!
  const data = await userService.getMe(id)

  sendSuccess({ res, data })
}

export const updateMeController = async (req: Request, res: Response) => {
  const validated = req.validated as UpdateMeValidated
  const data = await userService.updateMe({
    userId: req.user!.id,
    ...validated.body
  })

  sendSuccess({ res, data })
}
