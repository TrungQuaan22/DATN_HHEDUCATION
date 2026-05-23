import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type { ListPublicBlogPostsDto } from '../dto/public.dto'
import { publicBlogService } from '../services/public.service'
import {
  getPublicBlogPostSchema,
  listPublicBlogCategoriesSchema,
  listPublicBlogPostsSchema,
  listPublicBlogTagsSchema
} from '../validators/public.validator'

type ListPublicBlogPostsValidated = z.infer<typeof listPublicBlogPostsSchema>
type ListPublicBlogTagsValidated = z.infer<typeof listPublicBlogTagsSchema>
type ListPublicBlogCategoriesValidated = z.infer<typeof listPublicBlogCategoriesSchema>
type GetPublicBlogPostValidated = z.infer<typeof getPublicBlogPostSchema>

export const listPublicBlogPostsController = async (req: Request, res: Response) => {
  const validated = req.validated as ListPublicBlogPostsValidated
  const dto: ListPublicBlogPostsDto = validated.query
  const data = await publicBlogService.listPosts(dto)

  sendSuccess({ res, data })
}

export const listPublicBlogTagsController = async (req: Request, res: Response) => {
  const validated = req.validated as ListPublicBlogTagsValidated
  const data = await publicBlogService.listTags(validated.query)

  sendSuccess({ res, data })
}

export const listPublicBlogCategoriesController = async (req: Request, res: Response) => {
  const validated = req.validated as ListPublicBlogCategoriesValidated
  const data = await publicBlogService.listCategories(validated.query)

  sendSuccess({ res, data })
}

export const getPublicBlogPostController = async (req: Request, res: Response) => {
  const validated = req.validated as GetPublicBlogPostValidated
  const data = await publicBlogService.getPost(validated.params.slug)

  sendSuccess({ res, data })
}
