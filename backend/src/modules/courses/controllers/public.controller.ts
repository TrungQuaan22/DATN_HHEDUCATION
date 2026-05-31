import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type { ListCatalogCoursesDto } from '../dto'
import { PublicCourseService, publicCourseService } from '../services/public.service'
import { getCatalogCourseSchema, listCatalogCoursesSchema } from '../validators/public.validator'

type ListCatalogCoursesValidated = z.infer<typeof listCatalogCoursesSchema>
type GetCatalogCourseValidated = z.infer<typeof getCatalogCourseSchema>

export class PublicCourseController {
  constructor(private readonly service: PublicCourseService) {}

  listCatalogCourses = async (req: Request, res: Response) => {
    const validated = req.validated as ListCatalogCoursesValidated
    const dto: ListCatalogCoursesDto = validated.query
    const data = await this.service.listCatalogCourses(dto)

    sendSuccess({ res, data })
  }

  getCatalogCourse = async (req: Request, res: Response) => {
    const validated = req.validated as GetCatalogCourseValidated
    const data = await this.service.getCatalogCourse(validated.params.courseSlug)

    sendSuccess({ res, data })
  }
}

export const publicCourseController = new PublicCourseController(publicCourseService)

export const listCatalogCoursesController = publicCourseController.listCatalogCourses
export const getCatalogCourseController = publicCourseController.getCatalogCourse
