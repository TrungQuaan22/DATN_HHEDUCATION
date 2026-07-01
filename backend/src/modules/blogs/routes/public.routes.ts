import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  getPublicBlogPostController,
  listPublicBlogCategoriesController,
  listPublicBlogTagsController,
  listPublicBlogPostsController
} from '../controllers/public.controller'
import {
  getPublicBlogPostSchema,
  listPublicBlogCategoriesSchema,
  listPublicBlogPostsSchema,
  listPublicBlogTagsSchema
} from '../validators/public.validator'

export const publicBlogRoutes = Router()

publicBlogRoutes.get(
  '/blog-posts',
  validateRequest(listPublicBlogPostsSchema),
  asyncHandler(listPublicBlogPostsController)
)

publicBlogRoutes.get(
  '/blog-posts/categories',
  validateRequest(listPublicBlogCategoriesSchema),
  asyncHandler(listPublicBlogCategoriesController)
)

publicBlogRoutes.get(
  '/blog-posts/tags',
  validateRequest(listPublicBlogTagsSchema),
  asyncHandler(listPublicBlogTagsController)
)

publicBlogRoutes.get(
  '/blog-posts/:slug',
  validateRequest(getPublicBlogPostSchema),
  asyncHandler(getPublicBlogPostController)
)
