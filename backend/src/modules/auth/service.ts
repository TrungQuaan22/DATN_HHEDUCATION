import type {
  LoginDto,
  LoginResponse,
  RefreshTokenDto,
  RefreshTokenResponse,
  RegisterDto,
  RegisterResponse
} from './dto'
import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import type { RefreshTokenPayload } from './utils'
import { TokenType } from '~/common/constant/enums'
import { mapAuthUserToLoginUser, mapAuthUserToRegisterResponse } from './mappers/auth.mapper'
import type { AuthRepositoryPort } from './ports/auth-repository.port'
import type { PasswordHasherPort } from './ports/password-hasher.port'
import type { TokenServicePort } from './ports/token-service.port'
import { validateRefreshSession, validateUserCanLogin } from './policies/auth.policy'

export class AuthService {
  constructor(
    private readonly repository: AuthRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenService: TokenServicePort
  ) {}

  private async verifyRefreshPayload(refreshToken: string): Promise<RefreshTokenPayload> {
    let payload: RefreshTokenPayload
    try {
      payload = await this.tokenService.verifyRefreshToken(refreshToken)
    } catch {
      throw new AppError(401, ERROR_CODE.INVALID_REFRESH_TOKEN, ERROR_MESSAGE.INVALID_REFRESH_TOKEN)
    }

    if (payload.tokenType !== TokenType.REFRESH) {
      throw new AppError(401, ERROR_CODE.INVALID_REFRESH_TOKEN, ERROR_MESSAGE.INVALID_REFRESH_TOKEN)
    }

    return payload
  }

  async register(input: RegisterDto): Promise<RegisterResponse> {
    const existed = await this.repository.findUserByEmail(input.email)

    if (existed) {
      throw new AppError(409, ERROR_CODE.EMAIL_ALREADY_EXISTS, ERROR_MESSAGE.EMAIL_ALREADY_EXISTS)
    }

    const passwordHash = await this.passwordHasher.hashPassword(input.password)
    const user = await this.repository.createStudent({
      fullName: input.fullName,
      email: input.email,
      passwordHash
    })

    return mapAuthUserToRegisterResponse(user)
  }

  async login(input: LoginDto): Promise<LoginResponse> {
    const userRecord = await this.repository.findUserByEmail(input.email)

    if (!userRecord) {
      throw new AppError(401, ERROR_CODE.INVALID_CREDENTIALS, ERROR_MESSAGE.INVALID_CREDENTIALS)
    }

    const isPasswordValid = await this.passwordHasher.verifyPassword(
      input.password,
      userRecord.passwordHash
    )

    if (!isPasswordValid) {
      throw new AppError(401, ERROR_CODE.INVALID_CREDENTIALS, ERROR_MESSAGE.INVALID_CREDENTIALS)
    }

    validateUserCanLogin(userRecord.status)

    const tokens = await this.tokenService.createLoginTokens({
      userId: userRecord.id,
      role: userRecord.role
    })
    const loginUser = mapAuthUserToLoginUser(userRecord)

    await this.repository.createSession({
      id: tokens.sessionId,
      userId: userRecord.id,
      refreshTokenHash: tokens.refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiresAt
    })

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: loginUser
    }
  }

  async refreshToken(input: RefreshTokenDto): Promise<RefreshTokenResponse> {
    const payload = await this.verifyRefreshPayload(input.refreshToken)

    const rawSession = await this.repository.findSessionById(payload.sessionId)
    if (!rawSession) {
      throw new AppError(401, ERROR_CODE.INVALID_REFRESH_TOKEN, ERROR_MESSAGE.INVALID_REFRESH_TOKEN)
    }

    validateRefreshSession(rawSession, payload.userId, new Date())

    if (rawSession.user.status === 'banned') {
      await this.repository.revokeSession(rawSession.id)
      throw new AppError(403, ERROR_CODE.ACCOUNT_BANNED, ERROR_MESSAGE.ACCOUNT_BANNED)
    }

    const isCurrentRefreshToken = await this.passwordHasher.verifyPassword(
      input.refreshToken,
      rawSession.refreshTokenHash
    )

    if (!isCurrentRefreshToken) {
      throw new AppError(401, ERROR_CODE.INVALID_REFRESH_TOKEN, ERROR_MESSAGE.INVALID_REFRESH_TOKEN)
    }

    const tokens = await this.tokenService.createLoginTokens({
      userId: rawSession.userId,
      role: rawSession.user.role,
      sessionId: rawSession.id
    })

    const sessionWasRotated = await this.repository.rotateSessionRefreshToken({
      sessionId: rawSession.id,
      expectedRefreshTokenHash: rawSession.refreshTokenHash,
      newRefreshTokenHash: tokens.refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiresAt
    })

    if (!sessionWasRotated) {
      throw new AppError(401, ERROR_CODE.INVALID_REFRESH_TOKEN, ERROR_MESSAGE.INVALID_REFRESH_TOKEN)
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  }
}
