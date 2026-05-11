import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type { CreateTeacherDto, ListUsersDto, UpdateUserStatusDto } from '../dto/admin.dto'
import { adminService } from '../services/admin.service'
import {
  updateUserStatusSchema,
  createTeacherSchema,
  listUsersSchema
} from '../validators/admin.validator'

type CreateTeacherValidated = z.infer<typeof createTeacherSchema>
type ListUsersValidated = z.infer<typeof listUsersSchema>
type UpdateUserStatusValidated = z.infer<typeof updateUserStatusSchema>

export const createTeacherController = async (req: Request, res: Response) => {
  const validated = req.validated as CreateTeacherValidated
  const dto: CreateTeacherDto = validated.body
  const data = await adminService.createTeacher(dto)

  sendSuccess({ res, data, status: 201 })
}

export const getAllUsersController = async (req: Request, res: Response) => {
  const validated = req.validated as ListUsersValidated
  const dto: ListUsersDto = validated.query
  const data = await adminService.getAllUsers(dto)

  sendSuccess({ res, data })
}

export const updateUserStatusController = async (req: Request, res: Response) => {
  const validated = req.validated as UpdateUserStatusValidated
  const dto: UpdateUserStatusDto = {
    userId: validated.params.userId,
    status: validated.body.status
  }

  await adminService.updateUserStatus(dto)

  sendSuccess({ res, data: null })
}
