import type { Prisma, UserStatus } from '@prisma/client'

import { prisma } from '~/config/db'

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

export const userRepository = {
  findUserProfileById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userListSelect
    })
  },

  listUsers(data: { where: Prisma.UserWhereInput; skip: number; take: number }) {
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
  },

  updateUserStatus(data: { userId: string; status: UserStatus }) {
    return prisma.user.update({
      where: { id: data.userId },
      data: { status: data.status }
    })
  },

  updateUserProfile(data: {
    userId: string
    fullName?: string
    avatarMediaId?: string | null
    avatarObjectKey?: string | null
  }) {
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
