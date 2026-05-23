import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type {
  BlogPostIdDto,
  CreateBlogPostDto,
  ListAdminBlogPostsDto,
  UpdateBlogPostDto
} from '../dto/admin.dto'
import { adminBlogService } from '../services/admin.service'
import {
  changeBlogPostStatusSchema,
  createBlogPostSchema,
  deleteBlogPostSchema,
  getAdminBlogPostSchema,
  listAdminBlogCategoriesSchema,
  listAdminBlogPostsSchema,
  listAdminBlogTagsSchema,
  updateBlogPostSchema
} from '../validators/admin.validator'

type CreateBlogPostValidated = z.infer<typeof createBlogPostSchema>
type ListAdminBlogPostsValidated = z.infer<typeof listAdminBlogPostsSchema>
type ListAdminBlogTagsValidated = z.infer<typeof listAdminBlogTagsSchema>
type ListAdminBlogCategoriesValidated = z.infer<typeof listAdminBlogCategoriesSchema>
type GetAdminBlogPostValidated = z.infer<typeof getAdminBlogPostSchema>
type UpdateBlogPostValidated = z.infer<typeof updateBlogPostSchema>
type ChangeBlogPostStatusValidated = z.infer<typeof changeBlogPostStatusSchema>
type DeleteBlogPostValidated = z.infer<typeof deleteBlogPostSchema>

const getActor = (req: Request) => {
  if (!req.user) {
    throw new Error('Authenticated user is required')
  }

  return req.user
}

export const createBlogPostController = async (req: Request, res: Response) => {
  const validated = req.validated as CreateBlogPostValidated
  const actor = getActor(req)
  const dto: CreateBlogPostDto = {
    ...validated.body,
    authorId: actor.id,
    actorRole: actor.role
  }
  const data = await adminBlogService.createPost(dto)

  sendSuccess({ res, data, status: 201 })
}

export const listAdminBlogPostsController = async (req: Request, res: Response) => {
  const validated = req.validated as ListAdminBlogPostsValidated
  const actor = getActor(req)
  const dto: ListAdminBlogPostsDto = {
    ...validated.query,
    actorId: actor.id,
    actorRole: actor.role
  }
  const data = await adminBlogService.listPosts(dto)

  sendSuccess({ res, data })
}

export const listAdminBlogTagsController = async (req: Request, res: Response) => {
  const validated = req.validated as ListAdminBlogTagsValidated
  const actor = getActor(req)
  const data = await adminBlogService.listTags({
    ...validated.query,
    actorId: actor.id,
    actorRole: actor.role
  })

  sendSuccess({ res, data })
}

export const listAdminBlogCategoriesController = async (req: Request, res: Response) => {
  const validated = req.validated as ListAdminBlogCategoriesValidated
  const actor = getActor(req)
  const data = await adminBlogService.listCategories({
    ...validated.query,
    actorId: actor.id,
    actorRole: actor.role
  })

  sendSuccess({ res, data })
}

export const getAdminBlogPostController = async (req: Request, res: Response) => {
  const validated = req.validated as GetAdminBlogPostValidated
  const actor = getActor(req)
  const dto: BlogPostIdDto = {
    blogPostId: validated.params.blogPostId,
    actorId: actor.id,
    actorRole: actor.role
  }
  const data = await adminBlogService.getPost(dto)

  sendSuccess({ res, data })
}

export const updateBlogPostController = async (req: Request, res: Response) => {
  const validated = req.validated as UpdateBlogPostValidated
  const actor = getActor(req)
  const dto: UpdateBlogPostDto = {
    blogPostId: validated.params.blogPostId,
    actorId: actor.id,
    actorRole: actor.role,
    ...validated.body
  }
  const data = await adminBlogService.updatePost(dto)

  sendSuccess({ res, data })
}

export const publishBlogPostController = async (req: Request, res: Response) => {
  const validated = req.validated as ChangeBlogPostStatusValidated
  const actor = getActor(req)
  const data = await adminBlogService.publishPost({
    blogPostId: validated.params.blogPostId,
    actorId: actor.id,
    actorRole: actor.role
  })

  sendSuccess({ res, data })
}

export const unpublishBlogPostController = async (req: Request, res: Response) => {
  const validated = req.validated as ChangeBlogPostStatusValidated
  const actor = getActor(req)
  const data = await adminBlogService.unpublishPost({
    blogPostId: validated.params.blogPostId,
    actorId: actor.id,
    actorRole: actor.role
  })

  sendSuccess({ res, data })
}

export const deleteBlogPostController = async (req: Request, res: Response) => {
  const validated = req.validated as DeleteBlogPostValidated
  const actor = getActor(req)
  const data = await adminBlogService.deletePost({
    blogPostId: validated.params.blogPostId,
    actorId: actor.id,
    actorRole: actor.role
  })

  sendSuccess({ res, data })
}
