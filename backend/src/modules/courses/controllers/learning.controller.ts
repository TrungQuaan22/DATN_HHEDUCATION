import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import { learningCourseService } from '../services/learning.service'
import { getLearningCourseSchema } from '../validators/learning.validator'

type GetLearningCourseValidated = z.infer<typeof getLearningCourseSchema>

// Handles the "my learning courses" request for the authenticated student.
export const listMyLearningCoursesController = async (req: Request, res: Response) => {
  const data = await learningCourseService.listMyCourses(req.user!.id)

  sendSuccess({ res, data })
}

// Handles one enrolled course detail request for the learning page.
export const getLearningCourseController = async (req: Request, res: Response) => {
  const validated = req.validated as GetLearningCourseValidated
  const data = await learningCourseService.getLearningCourse({
    userId: req.user!.id,
    courseSlug: validated.params.courseSlug
  })

  sendSuccess({ res, data })
}
