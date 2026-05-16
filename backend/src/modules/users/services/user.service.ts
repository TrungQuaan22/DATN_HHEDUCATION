import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { ensureActorCanUseImageMedia } from '~/common/ensures/media.ensure'
import { mapUserAvatar } from '~/modules/users/mappers/user.mapper'

import type {
  GetMeResponseDto,
  UpdateMeDto,
  UpdateMeResponseDto
} from '../dto/user.dto'
import { userRepository } from '../repository'

export const userService = {
  async getMe(userId: string): Promise<GetMeResponseDto> {
    const user = await userRepository.findUserProfileById(userId)

    if (!user) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, ERROR_MESSAGE.NOT_FOUND)
    }

    return mapUserAvatar(user)
  },

  async updateMe(input: UpdateMeDto): Promise<UpdateMeResponseDto> {
    const user = await userRepository.findUserProfileById(input.userId)

    if (!user) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, ERROR_MESSAGE.NOT_FOUND)
    }

    const avatarMedia = input.avatarMediaId
      ? await ensureActorCanUseImageMedia({
          actor: { id: input.userId, role: user.role },
          mediaId: input.avatarMediaId,
          label: 'Avatar media'
        })
      : null

    const updatedUser = await userRepository.updateUserProfile({
      ...input,
      avatarObjectKey: input.avatarMediaId === undefined ? undefined : avatarMedia?.objectKey ?? null
    })

    return mapUserAvatar(updatedUser)
  }
}
