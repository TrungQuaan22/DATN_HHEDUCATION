import type { Prisma } from '@prisma/client'
import { UserRole, UserStatus } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { authRepository } from '~/modules/auth/repository'
import { hashPassword } from '~/modules/auth/utils/password'
import { ensureActorCanUseImageMedia } from '~/common/ensures/media.ensure'
import { mapUserAvatar } from '~/modules/users/mappers/user.mapper'

import type {
  CreateTeacherDto,
  CreateTeacherResponseDto,
  ListUsersDto,
  ListUsersResponseDto,
  UpdateUserStatusDto
} from '../dto/admin.dto'
import { userRepository } from '../repository'

export const adminService = {
  createTeacher: async (input: CreateTeacherDto): Promise<CreateTeacherResponseDto> => {
    const existed = await authRepository.findUserByEmail(input.email)

    if (existed) {
      throw new AppError(409, ERROR_CODE.EMAIL_ALREADY_EXISTS, ERROR_MESSAGE.EMAIL_ALREADY_EXISTS)
    }

    const passwordHash = await hashPassword(input.password)
    const avatarMedia = input.avatarMediaId
      ? await ensureActorCanUseImageMedia({
          actor: { id: input.actorId, role: UserRole.admin },
          mediaId: input.avatarMediaId,
          label: 'Avatar media'
        })
      : null

    const user = await authRepository.createTeacher({
      fullName: input.fullName,
      email: input.email,
      avatarMediaId: input.avatarMediaId,
      avatarObjectKey: avatarMedia?.objectKey ?? null,
      passwordHash
    })
    const mappedUser = mapUserAvatar(user)

    return {
      id: mappedUser.id,
      email: mappedUser.email,
      fullName: mappedUser.fullName,
      avatarMediaId: mappedUser.avatarMediaId,
      avatarUrl: mappedUser.avatarUrl,
      role: UserRole.teacher,
      status: UserStatus.active
    }
  },

  getAllUsers: async (input: ListUsersDto): Promise<ListUsersResponseDto> => {
    const where: Prisma.UserWhereInput = {
      role: input.role,
      status: input.status,
      deletedAt: null
    }

    if (input.search) {
      where.OR = [
        { email: { contains: input.search, mode: 'insensitive' } },
        { fullName: { contains: input.search, mode: 'insensitive' } }
      ]
    }

    const skip = (input.page - 1) * input.limit
    const [items, totalItems] = await userRepository.listUsers({
      where,
      skip,
      take: input.limit
    })

    return {
      items: items.map(mapUserAvatar),
      pagination: {
        page: input.page,
        limit: input.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / input.limit)
      }
    }
  },

  updateUserStatus: async (input: UpdateUserStatusDto) => {
    const user = await userRepository.findUserProfileById(input.userId)

    if (!user) {
      throw new AppError(404, ERROR_CODE.USER_NOT_FOUND, ERROR_MESSAGE.USER_NOT_FOUND)
    }

    await userRepository.updateUserStatus(input)
  }
}
