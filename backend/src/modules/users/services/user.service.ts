import { ERROR_CODE } from "~/common/constant/error-code";
import { ERROR_MESSAGE } from "~/common/constant/error-message";
import { AppError } from "~/common/error/app-error";

import type { GetMeResponseDto } from "../dto/user.dto";
import { userRepository } from "../repository";

export const userService = {
  async getMe(userId: string): Promise<GetMeResponseDto> {
    const user = await userRepository.findUserProfileById(userId);

    if (!user) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, ERROR_MESSAGE.NOT_FOUND);
    }

    return user;
  },
};
