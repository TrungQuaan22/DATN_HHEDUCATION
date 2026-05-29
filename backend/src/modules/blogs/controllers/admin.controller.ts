import type { Request, Response } from 'express'
import z from 'zod'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { sendSuccess } from '~/common/http/response'

import type {
  BlogPostIdDto,
  CreateBlogPostDto,
  ListAdminBlogPostsDto,
  UpdateBlogPostDto
} from '../dto'
import { AdminBlogService, adminBlogService } from '../services/admin.service'
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
    throw new AppError(401, ERROR_CODE.UNAUTHORIZED, ERROR_MESSAGE.UNAUTHORIZED)
  }

  return req.user
}

export class AdminBlogController {
  constructor(private readonly service: AdminBlogService) {}

  createPost = async (req: Request, res: Response) => {
    const validated = req.validated as CreateBlogPostValidated
    const actor = getActor(req)
    const dto: CreateBlogPostDto = {
      ...validated.body,
      authorId: actor.id,
      actorRole: actor.role
    }
    const data = await this.service.createPost(dto)

    sendSuccess({ res, data, status: 201 })
  }

  listPosts = async (req: Request, res: Response) => {
    const validated = req.validated as ListAdminBlogPostsValidated
    const actor = getActor(req)
    const dto: ListAdminBlogPostsDto = {
      ...validated.query,
      actorId: actor.id,
      actorRole: actor.role
    }
    const data = await this.service.listPosts(dto)

    sendSuccess({ res, data })
  }

  listTags = async (req: Request, res: Response) => {
    const validated = req.validated as ListAdminBlogTagsValidated
    const actor = getActor(req)
    const data = await this.service.listTags({
      ...validated.query,
      actorId: actor.id,
      actorRole: actor.role
    })

    sendSuccess({ res, data })
  }

  listCategories = async (req: Request, res: Response) => {
    const validated = req.validated as ListAdminBlogCategoriesValidated
    const actor = getActor(req)
    const data = await this.service.listCategories({
      ...validated.query,
      actorId: actor.id,
      actorRole: actor.role
    })

    sendSuccess({ res, data })
  }

  getPost = async (req: Request, res: Response) => {
    const validated = req.validated as GetAdminBlogPostValidated
    const actor = getActor(req)
    const dto: BlogPostIdDto = {
      blogPostId: validated.params.blogPostId,
      actorId: actor.id,
      actorRole: actor.role
    }
    const data = await this.service.getPost(dto)

    sendSuccess({ res, data })
  }

  updatePost = async (req: Request, res: Response) => {
    const validated = req.validated as UpdateBlogPostValidated
    const actor = getActor(req)
    const dto: UpdateBlogPostDto = {
      blogPostId: validated.params.blogPostId,
      actorId: actor.id,
      actorRole: actor.role,
      ...validated.body
    }
    const data = await this.service.updatePost(dto)

    sendSuccess({ res, data })
  }

  publishPost = async (req: Request, res: Response) => {
    const validated = req.validated as ChangeBlogPostStatusValidated
    const actor = getActor(req)
    const data = await this.service.publishPost({
      blogPostId: validated.params.blogPostId,
      actorId: actor.id,
      actorRole: actor.role
    })

    sendSuccess({ res, data })
  }

  unpublishPost = async (req: Request, res: Response) => {
    const validated = req.validated as ChangeBlogPostStatusValidated
    const actor = getActor(req)
    const data = await this.service.unpublishPost({
      blogPostId: validated.params.blogPostId,
      actorId: actor.id,
      actorRole: actor.role
    })

    sendSuccess({ res, data })
  }

  deletePost = async (req: Request, res: Response) => {
    const validated = req.validated as DeleteBlogPostValidated
    const actor = getActor(req)
    const data = await this.service.deletePost({
      blogPostId: validated.params.blogPostId,
      actorId: actor.id,
      actorRole: actor.role
    })

    sendSuccess({ res, data })
  }
}

export const adminBlogController = new AdminBlogController(adminBlogService)

export const createBlogPostController = adminBlogController.createPost
export const listAdminBlogPostsController = adminBlogController.listPosts
export const listAdminBlogTagsController = adminBlogController.listTags
export const listAdminBlogCategoriesController = adminBlogController.listCategories
export const getAdminBlogPostController = adminBlogController.getPost
export const updateBlogPostController = adminBlogController.updatePost
export const publishBlogPostController = adminBlogController.publishPost
export const unpublishBlogPostController = adminBlogController.unpublishPost
export const deleteBlogPostController = adminBlogController.deletePost
