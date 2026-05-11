import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type { ListCatalogCoursesDto } from '../dto/public.dto'
import { publicCourseService } from '../services/public.service'
import { getCatalogCourseSchema, listCatalogCoursesSchema } from '../validators/public.validator'

type ListCatalogCoursesValidated = z.infer<typeof listCatalogCoursesSchema>
type GetCatalogCourseValidated = z.infer<typeof getCatalogCourseSchema>

export const listCatalogCoursesController = async (req: Request, res: Response) => {
  const validated = req.validated as ListCatalogCoursesValidated
  const dto: ListCatalogCoursesDto = validated.query
  const data = await publicCourseService.listCatalogCourses(dto)

  sendSuccess({ res, data })
}

export const getCatalogCourseController = async (req: Request, res: Response) => {
  const validated = req.validated as GetCatalogCourseValidated
  const data = await publicCourseService.getCatalogCourse(validated.params.courseSlug)

  sendSuccess({ res, data })
}
