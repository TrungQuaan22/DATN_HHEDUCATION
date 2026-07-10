import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type { CourseIdDto, CreateCourseDto, ListAdminCoursesDto, UpdateCourseDto } from '../dto'
import { type AdminCourseService, adminCourseService } from '../services/admin-courses.service'
import {
  changeCourseStatusSchema,
  createCourseSchema,
  getAdminCourseSchema,
  listAdminCoursesSchema,
  updateCourseSchema
} from '../validators/admin-courses.validator'

type CreateCourseValidated = z.infer<typeof createCourseSchema>
type ListAdminCoursesValidated = z.infer<typeof listAdminCoursesSchema>
type GetAdminCourseValidated = z.infer<typeof getAdminCourseSchema>
type UpdateCourseValidated = z.infer<typeof updateCourseSchema>
type ChangeCourseStatusValidated = z.infer<typeof changeCourseStatusSchema>

export class AdminCourseController {
  constructor(private readonly service: AdminCourseService) {}

  createCourse = async (req: Request, res: Response) => {
    const validated = req.validated as CreateCourseValidated
    const dto: CreateCourseDto = validated.body
    const data = await this.service.createCourse(req.user!, dto)

    sendSuccess({ res, data, status: 201 })
  }

  listAdminCourses = async (req: Request, res: Response) => {
    const validated = req.validated as ListAdminCoursesValidated
    const dto: ListAdminCoursesDto = validated.query
    const data = await this.service.listCourses(req.user!, dto)

    sendSuccess({ res, data })
  }

  getAdminCourseStats = async (req: Request, res: Response) => {
    const data = await this.service.getStats(req.user!)

    sendSuccess({ res, data })
  }

  getAdminCourse = async (req: Request, res: Response) => {
    const validated = req.validated as GetAdminCourseValidated
    const dto: CourseIdDto = {
      courseId: validated.params.courseId
    }
    const data = await this.service.getCourse(req.user!, dto)

    sendSuccess({ res, data })
  }

  updateCourse = async (req: Request, res: Response) => {
    const validated = req.validated as UpdateCourseValidated
    const dto: UpdateCourseDto = {
      courseId: validated.params.courseId,
      ...validated.body
    }
    const data = await this.service.updateCourse(req.user!, dto)

    sendSuccess({ res, data })
  }

  publishCourse = async (req: Request, res: Response) => {
    const validated = req.validated as ChangeCourseStatusValidated
    const data = await this.service.publishCourse({
      courseId: validated.params.courseId
    })

    sendSuccess({ res, data })
  }

  archiveCourse = async (req: Request, res: Response) => {
    const validated = req.validated as ChangeCourseStatusValidated
    const data = await this.service.archiveCourse({
      courseId: validated.params.courseId
    })

    sendSuccess({ res, data })
  }
}

export const adminCourseController = new AdminCourseController(adminCourseService)

export const createCourseController = adminCourseController.createCourse
export const listAdminCoursesController = adminCourseController.listAdminCourses
export const getAdminCourseStatsController = adminCourseController.getAdminCourseStats
export const getAdminCourseController = adminCourseController.getAdminCourse
export const updateCourseController = adminCourseController.updateCourse
export const publishCourseController = adminCourseController.publishCourse
export const archiveCourseController = adminCourseController.archiveCourse
