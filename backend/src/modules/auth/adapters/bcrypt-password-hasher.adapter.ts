import { hashPassword, verifyPassword } from '../utils'
import type { PasswordHasherPort } from '../ports/password-hasher.port'

export class BcryptPasswordHasherAdapter implements PasswordHasherPort {
  hashPassword(password: string): Promise<string> {
    return hashPassword(password)
  }

  verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return verifyPassword(password, passwordHash)
  }
}
