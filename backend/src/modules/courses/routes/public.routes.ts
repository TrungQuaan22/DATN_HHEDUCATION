import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  getCatalogCourseController,
  listCatalogCoursesController
} from '../controllers/public.controller'
import { getCatalogCourseSchema, listCatalogCoursesSchema } from '../validators/public.validator'

export const publicCourseRoutes = Router()

publicCourseRoutes.get(
  '/courses',
  validateRequest(listCatalogCoursesSchema),
  asyncHandler(listCatalogCoursesController)
)

publicCourseRoutes.get(
  '/courses/:courseSlug',
  validateRequest(getCatalogCourseSchema),
  asyncHandler(getCatalogCourseController)
)
