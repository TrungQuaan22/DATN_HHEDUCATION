import z from 'zod'
import { loginBodySchema, refreshTokenBodySchema, registerBodySchema } from './validator'
import { UserRole, UserStatus } from '@prisma/client'

export type LoginDto = z.infer<typeof loginBodySchema>

export type LoginResponseDto = {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    fullName: string
    role: UserRole
    status: UserStatus
  }
}

export type RefreshTokenDto = z.infer<typeof refreshTokenBodySchema>

export type RefreshTokenResponseDto = {
  accessToken: string
  refreshToken: string
}

export type RegisterDto = z.infer<typeof registerBodySchema>

export type RegisterResponseDto = {
  id: string
  email: string
  fullName: string
  role: 'student'
  status: 'active' // bypass pending verification for now
}
