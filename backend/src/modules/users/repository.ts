import { UserRole } from '@prisma/client'
import type { Prisma, UserStatus } from '@prisma/client'

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
    return prisma.$transaction([
      prisma.user.findMany({
        where: data.where,
        skip: data.skip,
        take: data.take,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: userListSelect
      }),
      prisma.user.count({
        where: data.where
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
    return prisma.$transaction([
      prisma.user.findMany({
        where: data.where,
        skip: data.skip,
        take: data.take,
        orderBy: [{ fullName: 'asc' }, { id: 'asc' }],
        select: teacherOptionSelect
      }),
      prisma.user.count({
        where: data.where
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
