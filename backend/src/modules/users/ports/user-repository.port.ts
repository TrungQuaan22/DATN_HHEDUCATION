import type { Prisma, UserRole, UserStatus } from '@prisma/client'

export type UserProfileRecord = {
  id: string
  email: string
  fullName: string
  avatarMediaId: string | null
  avatarObjectKey: string | null
  role: UserRole
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

export type TeacherOptionRecord = {
  id: string
  email: string
  fullName: string
  avatarObjectKey: string | null
}

export type ListUsersInput = {
  where: Prisma.UserWhereInput
  skip: number
  take: number
}

export type ListTeacherOptionsInput = {
  where: Prisma.UserWhereInput
  skip: number
  take: number
}

export type UpdateUserProfileInput = {
  userId: string
  fullName?: string
  avatarMediaId?: string | null
  avatarObjectKey?: string | null
}

export interface UserRepositoryPort {
  findUserProfileById(id: string): Promise<UserProfileRecord | null>
  listUsers(data: ListUsersInput): Promise<[UserProfileRecord[], number]>
  getUserStats(data: { newUsersFrom: Date }): Promise<[number, number, number]>
  listTeacherOptions(data: ListTeacherOptionsInput): Promise<[TeacherOptionRecord[], number]>
  updateUserStatus(data: { userId: string; status: UserStatus }): Promise<unknown>
  updateUserProfile(data: UpdateUserProfileInput): Promise<UserProfileRecord>
}
