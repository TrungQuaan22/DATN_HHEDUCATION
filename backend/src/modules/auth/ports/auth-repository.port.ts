import type { UserRole, UserStatus } from '@prisma/client'

export type AuthUserRecord = {
  id: string
  email: string
  fullName: string
  passwordHash: string
  avatarMediaId: string | null
  avatarObjectKey: string | null
  role: UserRole
  status: UserStatus
}

export type AuthSessionWithUserRecord = {
  id: string
  userId: string
  refreshTokenHash: string
  expiresAt: Date
  isRevoked: boolean
  user: AuthUserRecord
}

export type CreateStudentInput = {
  fullName: string
  email: string
  passwordHash: string
}

export type CreateTeacherInput = {
  fullName: string
  email: string
  passwordHash: string
  avatarMediaId?: string | null
  avatarObjectKey?: string | null
}

export type CreateSessionInput = {
  id: string
  userId: string
  refreshTokenHash: string
  expiresAt: Date
}

export type RotateSessionRefreshTokenInput = {
  sessionId: string
  expectedRefreshTokenHash: string
  newRefreshTokenHash: string
  expiresAt: Date
}

export interface AuthRepositoryPort {
  findUserByEmail(email: string): Promise<AuthUserRecord | null>
  createStudent(data: CreateStudentInput): Promise<AuthUserRecord>
  createTeacher(data: CreateTeacherInput): Promise<AuthUserRecord>
  createSession(data: CreateSessionInput): Promise<unknown>
  findSessionById(id: string): Promise<AuthSessionWithUserRecord | null>
  rotateSessionRefreshToken(data: RotateSessionRefreshTokenInput): Promise<boolean>
  revokeSession(id: string): Promise<unknown>
}
