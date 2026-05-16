import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireAuth } from '~/common/middlewares/require-auth'
import { validateRequest } from '~/common/middlewares/validate-request'

import { getMeController, updateMeController } from '../controllers/user.controller'
import { updateMeSchema } from '../validators/user.validator'

export const userRoutes = Router()

userRoutes.get('/me', requireAuth, asyncHandler(getMeController))
userRoutes.patch('/me', requireAuth, validateRequest(updateMeSchema), asyncHandler(updateMeController))
