import { BcryptPasswordHasherAdapter } from '~/modules/auth/adapters/bcrypt-password-hasher.adapter'
import { authRepository } from '~/modules/auth/repository'
import { mediaRepository } from '~/modules/media/repository'

import { userRepository } from './repository'
import { AdminUserService } from './services/admin.service'
import { UserService } from './services/user.service'

export const userService = new UserService(userRepository, mediaRepository)
export const adminUserService = new AdminUserService(
  userRepository,
  authRepository,
  new BcryptPasswordHasherAdapter(),
  mediaRepository
)
