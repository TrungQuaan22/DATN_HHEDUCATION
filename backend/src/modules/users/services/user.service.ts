import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { ensureMediaExists } from '~/common/ensures/media.ensure'
import { validateImageMedia } from '~/common/policies/media.policy'
import { mapUserProfileToResponse } from '../mappers'

import type { GetMeResponse, UpdateMeDto, UpdateMeResponse } from '../dto'
import type { UserRepositoryPort } from '../ports/user-repository.port'
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

    const avatarMedia = input.avatarMediaId ? ensureMediaExists(media) : null

    if (avatarMedia) {
      validateImageMedia({ id: input.userId, role: user.role }, avatarMedia, 'Avatar media')
    }

    const updatedUser = await this.repository.updateUserProfile({
      ...input,
      avatarObjectKey:
        input.avatarMediaId === undefined ? undefined : (avatarMedia?.objectKey ?? null)
    })

    return mapUserProfileToResponse(updatedUser)
  }
}
