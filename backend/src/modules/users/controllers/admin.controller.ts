import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import type {
  CreateTeacherDto,
  ListTeacherOptionsDto,
  ListUsersDto,
  UpdateUserStatusDto
} from '../dto'
import type { AdminUserService } from '../services/admin.service'
import { adminUserService } from '../wiring'
import {
  createTeacherSchema,
  listTeacherOptionsSchema,
  listUsersSchema,
  updateUserStatusSchema
} from '../validators/admin.validator'

type CreateTeacherValidated = z.infer<typeof createTeacherSchema>
type ListTeacherOptionsValidated = z.infer<typeof listTeacherOptionsSchema>
type ListUsersValidated = z.infer<typeof listUsersSchema>
type UpdateUserStatusValidated = z.infer<typeof updateUserStatusSchema>

export class AdminUserController {
  constructor(private readonly service: AdminUserService) {}

  createTeacher = async (req: Request, res: Response) => {
    const validated = req.validated as CreateTeacherValidated
    const dto: CreateTeacherDto = {
      ...validated.body,
      actorId: req.user!.id
    }
    const data = await this.service.createTeacher(dto)

    sendSuccess({ res, data, status: 201 })
  }

  getAllUsers = async (req: Request, res: Response) => {
    const validated = req.validated as ListUsersValidated
    const dto: ListUsersDto = validated.query
    const data = await this.service.getAllUsers(dto)

    sendSuccess({ res, data })
  }

  listTeacherOptions = async (req: Request, res: Response) => {
    const validated = req.validated as ListTeacherOptionsValidated
    const dto: ListTeacherOptionsDto = validated.query
    const data = await this.service.listTeacherOptions(dto)

    sendSuccess({ res, data })
  }

  updateUserStatus = async (req: Request, res: Response) => {
    const validated = req.validated as UpdateUserStatusValidated
    const dto: UpdateUserStatusDto = {
      userId: validated.params.userId,
      status: validated.body.status
    }

    await this.service.updateUserStatus(dto)

    sendSuccess({ res, data: null })
  }
}

export const adminUserController = new AdminUserController(adminUserService)

export const createTeacherController = adminUserController.createTeacher
export const getAllUsersController = adminUserController.getAllUsers
export const listTeacherOptionsController = adminUserController.listTeacherOptions
export const updateUserStatusController = adminUserController.updateUserStatus
