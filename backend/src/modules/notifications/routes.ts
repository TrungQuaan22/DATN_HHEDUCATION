import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireActiveSession } from '~/common/middlewares/require-active-session'
import { requireAuth } from '~/common/middlewares/require-auth'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  getUnreadNotificationCountController,
  listNotificationsController,
  markAllNotificationsReadController,
  markNotificationReadController
} from './controller'
import { emptyNotificationSchema, listNotificationsSchema, notificationIdSchema } from './validator'

export const notificationRoutes = Router()

notificationRoutes.use(requireAuth, requireActiveSession)
notificationRoutes.get(
  '/',
  validateRequest(listNotificationsSchema),
  asyncHandler(listNotificationsController)
)
notificationRoutes.get(
  '/unread-count',
  validateRequest(emptyNotificationSchema),
  asyncHandler(getUnreadNotificationCountController)
)
notificationRoutes.patch(
  '/read-all',
  validateRequest(emptyNotificationSchema),
  asyncHandler(markAllNotificationsReadController)
)
notificationRoutes.patch(
  '/:notificationId/read',
  validateRequest(notificationIdSchema),
  asyncHandler(markNotificationReadController)
)
