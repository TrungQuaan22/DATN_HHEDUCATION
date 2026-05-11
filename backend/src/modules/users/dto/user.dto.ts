import type { UserRole, UserStatus } from '@prisma/client'

export type GetMeResponseDto = {
  id: string
  email: string
  fullName: string
  role: UserRole
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}
