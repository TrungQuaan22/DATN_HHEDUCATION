import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type {
  GetAdminCourseStudentProgressDto,
  ListAdminCourseStudentsDto
} from '../dto/admin-course-students.dto'
import {
  type AdminCourseStudentService,
  adminCourseStudentService
} from '../services/admin-course-students.service'
import {
  getAdminCourseStudentProgressSchema,
  listAdminCourseStudentsSchema
} from '../validators/admin-course-students.validator'

type ListCourseStudentsValidated = z.infer<typeof listAdminCourseStudentsSchema>
type GetStudentProgressValidated = z.infer<typeof getAdminCourseStudentProgressSchema>

export class AdminCourseStudentController {
  constructor(private readonly service: AdminCourseStudentService) {}

  listCourseStudents = async (req: Request, res: Response) => {
    const validated = req.validated as ListCourseStudentsValidated
    const dto: ListAdminCourseStudentsDto = {
      courseId: validated.params.courseId,
      ...validated.query
    }
    const data = await this.service.listCourseStudents(req.user!, dto)

    sendSuccess({ res, data })
  }

  getStudentProgress = async (req: Request, res: Response) => {
    const validated = req.validated as GetStudentProgressValidated
    const dto: GetAdminCourseStudentProgressDto = validated.params
    const data = await this.service.getStudentProgress(req.user!, dto)

    sendSuccess({ res, data })
  }
}

export const adminCourseStudentController = new AdminCourseStudentController(
  adminCourseStudentService
)

export const listCourseStudentsController = adminCourseStudentController.listCourseStudents
export const getCourseStudentProgressController = adminCourseStudentController.getStudentProgress
