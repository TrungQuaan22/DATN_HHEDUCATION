import type { UserRole, UserStatus } from '@prisma/client'
import z from 'zod'

import { createTeacherBodySchema, listUsersQuerySchema } from '../validators/admin.validator'

export type CreateTeacherDto = z.infer<typeof createTeacherBodySchema>

export type CreateTeacherResponseDto = {
  id: string
  email: string
  fullName: string
  role: 'teacher'
  status: 'active' // teacher can be active immediately without verification for now
}

export type ListUsersDto = z.infer<typeof listUsersQuerySchema>

export type AdminUserItemDto = {
  id: string
  email: string
  fullName: string
  role: UserRole
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

export type ListUsersResponseDto = {
  items: AdminUserItemDto[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export type UpdateUserStatusDto = {
  userId: string
  status: UserStatus
}
