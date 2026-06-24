import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireActiveSession } from '~/common/middlewares/require-active-session'
import { requireAuth } from '~/common/middlewares/require-auth'
import { requireRole } from '~/common/middlewares/require-role'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  createBlogPostController,
  createBlogCategoryController,
  deleteBlogPostController,
  getAdminBlogPostController,
  listAdminBlogCategoriesController,
  listAdminBlogTagsController,
  listAdminBlogPostsController,
  publishBlogPostController,
  unpublishBlogPostController,
  updateBlogPostController
} from '../controllers/admin.controller'
import {
  changeBlogPostStatusSchema,
  createBlogCategorySchema,
  createBlogPostSchema,
  deleteBlogPostSchema,
  getAdminBlogPostSchema,
  listAdminBlogCategoriesSchema,
  listAdminBlogPostsSchema,
  listAdminBlogTagsSchema,
  updateBlogPostSchema
} from '../validators/admin.validator'

export const adminBlogRoutes = Router()

adminBlogRoutes.post(
  '/blog-posts/categories',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(createBlogCategorySchema),
  asyncHandler(createBlogCategoryController)
)

adminBlogRoutes.post(
  '/blog-posts',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(createBlogPostSchema),
  asyncHandler(createBlogPostController)
)

adminBlogRoutes.get(
  '/blog-posts',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(listAdminBlogPostsSchema),
  asyncHandler(listAdminBlogPostsController)
)

adminBlogRoutes.get(
  '/blog-posts/categories',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(listAdminBlogCategoriesSchema),
  asyncHandler(listAdminBlogCategoriesController)
)

adminBlogRoutes.get(
  '/blog-posts/tags',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(listAdminBlogTagsSchema),
  asyncHandler(listAdminBlogTagsController)
)

adminBlogRoutes.get(
  '/blog-posts/:blogPostId',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(getAdminBlogPostSchema),
  asyncHandler(getAdminBlogPostController)
)

adminBlogRoutes.patch(
  '/blog-posts/:blogPostId',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(updateBlogPostSchema),
  asyncHandler(updateBlogPostController)
)

adminBlogRoutes.patch(
  '/blog-posts/:blogPostId/publish',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(changeBlogPostStatusSchema),
  asyncHandler(publishBlogPostController)
)

adminBlogRoutes.patch(
  '/blog-posts/:blogPostId/unpublish',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(changeBlogPostStatusSchema),
  asyncHandler(unpublishBlogPostController)
)

adminBlogRoutes.delete(
  '/blog-posts/:blogPostId',
  requireAuth,
  requireActiveSession,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(deleteBlogPostSchema),
  asyncHandler(deleteBlogPostController)
)
