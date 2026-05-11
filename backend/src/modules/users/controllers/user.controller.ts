import type { Request, Response } from 'express'

import { sendSuccess } from '~/common/http/response'

import { userService } from '../services/user.service'

export const getMeController = async (req: Request, res: Response) => {
  const { id } = req.user!
  const data = await userService.getMe(id)

  sendSuccess({ res, data })
}
