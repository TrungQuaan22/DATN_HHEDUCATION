import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { ensureActorCanUseImageMedia } from '~/common/ensures/media.ensure'
import { mapUserProfileToResponse } from '../mappers'

import type {
  GetMeResponse,
  UpdateMeDto,
  UpdateMeResponse
} from '../dto'
import { userRepository } from '../repository'
import type { UserRepositoryPort } from '../ports/user-repository.port'
import { mediaRepository } from '~/modules/media/repository'
import type { MediaRepositoryPort } from '~/modules/media/ports/media-repository.port'

export class UserService {
  constructor(
    private readonly repository: UserRepositoryPort,
    private readonly mediaRepository: MediaRepositoryPort
  ) {}

  async getMe(userId: string): Promise<GetMeResponse> {
    const user = await this.repository.findUserProfileById(userId)

    if (!user) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, ERROR_MESSAGE.NOT_FOUND)
    }

    return mapUserProfileToResponse(user)
  }

  async updateMe(input: UpdateMeDto): Promise<UpdateMeResponse> {
    const user = await this.repository.findUserProfileById(input.userId)

    if (!user) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, ERROR_MESSAGE.NOT_FOUND)
    }

    const media = input.avatarMediaId
      ? await this.mediaRepository.findMediaById(input.avatarMediaId)
      : null

    const avatarMedia = input.avatarMediaId
      ? ensureActorCanUseImageMedia({
          actor: { id: input.userId, role: user.role },
          media,
          label: 'Avatar media'
        })
      : null

    const updatedUser = await this.repository.updateUserProfile({
      ...input,
      avatarObjectKey: input.avatarMediaId === undefined ? undefined : avatarMedia?.objectKey ?? null
    })

    return mapUserProfileToResponse(updatedUser)
  }
}

export const userService = new UserService(userRepository, mediaRepository)
