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

export type CreateTeacherResponse = {
  id: string
  email: string
  fullName: string
  avatarMediaId: string | null
  avatarUrl: string | null
  role: 'teacher'
  status: 'active'
}

export type ListUsersDto = z.infer<typeof listUsersQuerySchema>

export type AdminUserItemResponse = {
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

export type ListUsersResponse = {
  items: AdminUserItemResponse[]
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

export type AdminTeacherOptionItemResponse = {
  id: string
  email: string
  fullName: string
  avatarUrl: string | null
}

export type ListTeacherOptionsResponse = {
  items: AdminTeacherOptionItemResponse[]
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
