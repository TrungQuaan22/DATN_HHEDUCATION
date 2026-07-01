import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { ensureMediaExists } from '~/common/ensures/media.ensure'
import { validateImageMedia } from '~/common/policies/media.policy'
import {
  mapAuthUserToCreateTeacherResponse,
  mapUserProfileToAdminItemResponse,
  mapTeacherOptionToResponse
} from '../mappers'
import type { MediaRepositoryPort } from '~/modules/media/ports/media-repository.port'

import type {
  CreateTeacherDto,
  CreateTeacherResponse,
  ListTeacherOptionsDto,
  ListTeacherOptionsResponse,
  ListUsersDto,
  ListUsersResponse,
  UpdateUserStatusDto
} from '../dto'
import type { UserRepositoryPort } from '../ports/user-repository.port'
import type { AuthRepositoryPort } from '~/modules/auth/ports/auth-repository.port'
import type { PasswordHasherPort } from '~/modules/auth/ports/password-hasher.port'

export class AdminUserService {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly auth: AuthRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly mediaRepository: MediaRepositoryPort
  ) {}

  async createTeacher(input: CreateTeacherDto): Promise<CreateTeacherResponse> {
    const existed = await this.auth.findUserByEmail(input.email)

    if (existed) {
      throw new AppError(409, ERROR_CODE.EMAIL_ALREADY_EXISTS, ERROR_MESSAGE.EMAIL_ALREADY_EXISTS)
    }

    const passwordHash = await this.passwordHasher.hashPassword(input.password)
    const media = input.avatarMediaId
      ? await this.mediaRepository.findMediaById(input.avatarMediaId)
      : null
    const avatarMedia = input.avatarMediaId ? ensureMediaExists(media) : null

    if (avatarMedia) {
      validateImageMedia({ id: input.actorId, role: 'admin' }, avatarMedia, 'Avatar media')
    }

    const user = await this.auth.createTeacher({
      fullName: input.fullName,
      email: input.email,
      avatarMediaId: input.avatarMediaId,
      avatarObjectKey: avatarMedia?.objectKey ?? null,
      passwordHash
    })

    return mapAuthUserToCreateTeacherResponse(user)
  }

  async getAllUsers(input: ListUsersDto): Promise<ListUsersResponse> {
    const newUsersFrom = new Date()
    newUsersFrom.setDate(newUsersFrom.getDate() - 30)

    const [[items, totalItems], [totalUsers, totalTeachers, newUsersLast30Days]] =
      await Promise.all([
        this.users.listUsers({
          role: input.role,
          status: input.status,
          search: input.search,
          page: input.page,
          limit: input.limit
        }),
        this.users.getUserStats({ newUsersFrom })
      ])

    return {
      items: items.map(mapUserProfileToAdminItemResponse),
      pagination: {
        page: input.page,
        limit: input.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / input.limit)
      },
      stats: {
        totalUsers,
        totalTeachers,
        newUsersLast30Days
      }
    }
  }

  async listTeacherOptions(input: ListTeacherOptionsDto): Promise<ListTeacherOptionsResponse> {
    const [teachers, totalItems] = await this.users.listTeacherOptions({
      search: input.search,
      page: input.page,
      limit: input.limit
    })

    return {
      items: teachers.map(mapTeacherOptionToResponse),
      pagination: {
        page: input.page,
        limit: input.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / input.limit)
      }
    }
  }

  async updateUserStatus(input: UpdateUserStatusDto) {
    const user = await this.users.findUserProfileById(input.userId)

    if (!user) {
      throw new AppError(404, ERROR_CODE.USER_NOT_FOUND, ERROR_MESSAGE.USER_NOT_FOUND)
    }

    await this.users.updateUserStatus(input)
  }
}
