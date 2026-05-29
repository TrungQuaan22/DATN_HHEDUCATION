import type { UserRole, UserStatus } from '@prisma/client'
import z from 'zod'

import {
  createTeacherBodySchema,
  listTeacherOptionsQuerySchema,
  listUsersQuerySchema
} from '../validators/admin.validator'

export type CreateTeacherDto = z.infer<typeof createTeacherBodySchema> & {
  actorId: string
}

export type CreateTeacherResponseDto = {
  id: string
  email: string
  fullName: string
  avatarMediaId: string | null
  avatarUrl: string | null
  role: 'teacher'
  status: 'active' // teacher can be active immediately without verification for now
}

export type ListUsersDto = z.infer<typeof listUsersQuerySchema>

export type AdminUserItemDto = {
  id: string
  email: string
  fullName: string
  avatarMediaId: string | null
  avatarUrl: string | null
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
  stats: {
    totalUsers: number
    totalTeachers: number
    newUsersLast30Days: number
  }
}

export type ListTeacherOptionsDto = z.infer<typeof listTeacherOptionsQuerySchema>

export type AdminTeacherOptionItemDto = {
  id: string
  email: string
  fullName: string
  avatarUrl: string | null
}

export type ListTeacherOptionsResponseDto = {
  items: AdminTeacherOptionItemDto[]
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
