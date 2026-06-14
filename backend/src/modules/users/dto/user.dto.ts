import type { UserRole, UserStatus } from '@prisma/client'
import z from 'zod'

import type { updateMeBodySchema } from '../validators/user.validator'

export type UpdateMeDto = z.infer<typeof updateMeBodySchema> & {
  userId: string
}

export type GetMeResponse = {
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

export type UpdateMeResponse = GetMeResponse
