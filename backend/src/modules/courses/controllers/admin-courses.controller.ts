import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type {
  CourseIdDto,
  CreateCourseDto,
  ListAdminCoursesDto,
  UpdateCourseDto
} from '../dto/admin-courses.dto'
import { adminCourseService } from '../services/admin-courses.service'
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

export const createCourseController = async (req: Request, res: Response) => {
  const validated = req.validated as CreateCourseValidated
  const dto: CreateCourseDto = validated.body
  const data = await adminCourseService.createCourse(dto)

  sendSuccess({ res, data, status: 201 })
}
//list courses for admin, includes unpublished and archived courses
export const listAdminCoursesController = async (req: Request, res: Response) => {
  const validated = req.validated as ListAdminCoursesValidated
  const dto: ListAdminCoursesDto = validated.query
  const data = await adminCourseService.listCourses(dto)

  sendSuccess({ res, data })
}

//get course for admin, includes unpublished and archived courses
export const getAdminCourseController = async (req: Request, res: Response) => {
  const validated = req.validated as GetAdminCourseValidated
  const dto: CourseIdDto = {
    courseId: validated.params.courseId
  }
  const data = await adminCourseService.getCourse(dto)

  sendSuccess({ res, data })
}

//update metadata and content of a course, does not update the status of the course
export const updateCourseController = async (req: Request, res: Response) => {
  const validated = req.validated as UpdateCourseValidated
  const dto: UpdateCourseDto = {
    courseId: validated.params.courseId,
    ...validated.body
  }
  const data = await adminCourseService.updateCourse(dto)

  sendSuccess({ res, data })
}

//publish a course, changes the status of the course to published
export const publishCourseController = async (req: Request, res: Response) => {
  const validated = req.validated as ChangeCourseStatusValidated
  const data = await adminCourseService.publishCourse({
    courseId: validated.params.courseId
  })

  sendSuccess({ res, data })
}

//archive a course, changes the status of the course to archived
export const archiveCourseController = async (req: Request, res: Response) => {
  const validated = req.validated as ChangeCourseStatusValidated
  const data = await adminCourseService.archiveCourse({
    courseId: validated.params.courseId
  })

  sendSuccess({ res, data })
}
