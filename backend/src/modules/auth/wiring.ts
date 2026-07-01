import { BcryptPasswordHasherAdapter } from './adapters/bcrypt-password-hasher.adapter'
import { JwtTokenServiceAdapter } from './adapters/jwt-token-service.adapter'
import { authRepository } from './repository'
import { AuthService } from './service'

export const authService = new AuthService(
  authRepository,
  new BcryptPasswordHasherAdapter(),
  new JwtTokenServiceAdapter()
)
