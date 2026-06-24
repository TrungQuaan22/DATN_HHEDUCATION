import { UserRole, UserStatus } from '@prisma/client'
import type { Prisma } from '@prisma/client'

import { prisma } from '~/config/db'
import type {
  ListTeacherOptionsInput,
  ListUsersInput,
  UpdateUserProfileInput,
  UserRepositoryPort
} from './ports/user-repository.port'

const userListSelect = {
  id: true,
  email: true,
  fullName: true,
  avatarMediaId: true,
  avatarObjectKey: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.UserSelect

const teacherOptionSelect = {
  id: true,
  email: true,
  fullName: true,
  avatarObjectKey: true
} satisfies Prisma.UserSelect

export class PrismaUserRepository implements UserRepositoryPort {
  findUserProfileById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userListSelect
    })
  }

  listUsers(data: ListUsersInput) {
    const where: Prisma.UserWhereInput = {
      role: data.role,
      status: data.status,
      deletedAt: null
    }

    if (data.search) {
      where.OR = [
        { email: { contains: data.search, mode: 'insensitive' } },
        { fullName: { contains: data.search, mode: 'insensitive' } }
      ]
    }

    return prisma.$transaction([
      prisma.user.findMany({
        where,
        skip: (data.page - 1) * data.limit,
        take: data.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: userListSelect
      }),
      prisma.user.count({
        where
      })
    ])
  }

  getUserStats(data: { newUsersFrom: Date }) {
    return prisma.$transaction([
      prisma.user.count({
        where: {
          deletedAt: null
        }
      }),
      prisma.user.count({
        where: {
          role: UserRole.teacher,
          deletedAt: null
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: data.newUsersFrom
          },
          deletedAt: null
        }
      })
    ])
  }

  listTeacherOptions(data: ListTeacherOptionsInput) {
    const where: Prisma.UserWhereInput = {
      role: UserRole.teacher,
      status: UserStatus.active,
      deletedAt: null
    }

    if (data.search) {
      where.fullName = { contains: data.search, mode: 'insensitive' }
    }

    return prisma.$transaction([
      prisma.user.findMany({
        where,
        skip: (data.page - 1) * data.limit,
        take: data.limit,
        orderBy: [{ fullName: 'asc' }, { id: 'asc' }],
        select: teacherOptionSelect
      }),
      prisma.user.count({
        where
      })
    ])
  }

  updateUserStatus(data: { userId: string; status: UserStatus }) {
    return prisma.user.update({
      where: { id: data.userId },
      data: { status: data.status }
    })
  }

  updateUserProfile(data: UpdateUserProfileInput) {
    return prisma.user.update({
      where: { id: data.userId },
      data: {
        fullName: data.fullName,
        avatarMediaId: data.avatarMediaId,
        avatarObjectKey: data.avatarObjectKey
      },
      select: userListSelect
    })
  }
}

export const userRepository = new PrismaUserRepository()
