import z from 'zod'
import { loginBodySchema, refreshTokenBodySchema, registerBodySchema } from './validator'
import { UserRole, UserStatus } from '@prisma/client'

export type LoginDto = z.infer<typeof loginBodySchema>

export type LoginResponse = {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    fullName: string
    avatarMediaId: string | null
    avatarUrl: string | null
    role: UserRole
    status: UserStatus
  }
}

export type RefreshTokenDto = z.infer<typeof refreshTokenBodySchema>

export type RefreshTokenResponse = {
  accessToken: string
  refreshToken: string
}

// Dữ liệu gửi lên khi đăng ký tài khoản mới
export type RegisterDto = z.infer<typeof registerBodySchema>

// Dữ liệu trả về sau khi đăng ký thành công
export type RegisterResponse = {
  id: string
  email: string
  fullName: string
  avatarMediaId: string | null
  avatarUrl: string | null
  role: 'student'
  status: 'active' // bypass pending verification for now
}
