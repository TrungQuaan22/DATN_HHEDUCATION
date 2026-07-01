import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type { ListPublicBlogPostsDto } from '../dto'
import type { PublicBlogService } from '../services/public.service'
import { publicBlogService } from '../wiring'
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

export class PublicBlogController {
  constructor(private readonly service: PublicBlogService) {}

  listPosts = async (req: Request, res: Response) => {
    const validated = req.validated as ListPublicBlogPostsValidated
    const dto: ListPublicBlogPostsDto = validated.query
    const data = await this.service.listPosts(dto)

    sendSuccess({ res, data })
  }

  listTags = async (req: Request, res: Response) => {
    const validated = req.validated as ListPublicBlogTagsValidated
    const data = await this.service.listTags(validated.query)

    sendSuccess({ res, data })
  }

  listCategories = async (req: Request, res: Response) => {
    const validated = req.validated as ListPublicBlogCategoriesValidated
    const data = await this.service.listCategories(validated.query)

    sendSuccess({ res, data })
  }

  getPost = async (req: Request, res: Response) => {
    const validated = req.validated as GetPublicBlogPostValidated
    const data = await this.service.getPost(validated.params.slug)

    sendSuccess({ res, data })
  }
}

export const publicBlogController = new PublicBlogController(publicBlogService)

export const listPublicBlogPostsController = publicBlogController.listPosts
export const listPublicBlogTagsController = publicBlogController.listTags
export const listPublicBlogCategoriesController = publicBlogController.listCategories
export const getPublicBlogPostController = publicBlogController.getPost
