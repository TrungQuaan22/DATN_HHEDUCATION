import { jwtConfig } from '~/config/jwt_config'

import { createLoginTokens, verifyRefreshToken } from '../utils'
import type {
  CreateLoginTokensInput,
  LoginTokens,
  TokenServicePort
} from '../ports/token-service.port'
import type { RefreshTokenPayload } from '../utils'

export class JwtTokenServiceAdapter implements TokenServicePort {
  createLoginTokens(input: CreateLoginTokensInput): Promise<LoginTokens> {
    return createLoginTokens(input)
  }

  verifyRefreshToken(refreshToken: string): Promise<RefreshTokenPayload> {
    return verifyRefreshToken({
      token: refreshToken,
      privateKey: jwtConfig.refreshToken.privateKey
    })
  }
}
