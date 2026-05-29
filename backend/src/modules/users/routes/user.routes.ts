import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireActiveSession } from '~/common/middlewares/require-active-session'
import { requireAuth } from '~/common/middlewares/require-auth'
import { validateRequest } from '~/common/middlewares/validate-request'

import { getMeController, updateMeController } from '../controllers/user.controller'
import { updateMeSchema } from '../validators/user.validator'

export const userRoutes = Router()

userRoutes.get('/me', requireAuth, asyncHandler(getMeController))
userRoutes.patch(
  '/me',
  requireAuth,
  requireActiveSession,
  validateRequest(updateMeSchema),
  asyncHandler(updateMeController)
)
