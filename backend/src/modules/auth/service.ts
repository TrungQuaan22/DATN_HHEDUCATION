import type {
  LoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  RegisterDto,
  RegisterResponseDto
} from './dto'
import { authRepository } from './repository'
import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { isWithinRefreshTokenRetryGrace, type RefreshTokenPayload } from './utils'
import { TokenType } from '~/common/constant/enums'
import { UserRole, UserStatus } from '@prisma/client'
import { mapUserAvatar } from '~/modules/users/mappers'
import type {
  AuthRepositoryPort,
  AuthSessionWithUserRecord
} from './ports/auth-repository.port'
import type { PasswordHasherPort } from './ports/password-hasher.port'
import type { TokenServicePort } from './ports/token-service.port'
import { BcryptPasswordHasherAdapter } from './adapters/bcrypt-password-hasher.adapter'
import { JwtTokenServiceAdapter } from './adapters/jwt-token-service.adapter'

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

  private async ensureSessionValid(
    session: AuthSessionWithUserRecord | null,
    payload: RefreshTokenPayload
  ): Promise<AuthSessionWithUserRecord> {
    if (!session || session.userId !== payload.userId) {
      throw new AppError(401, ERROR_CODE.INVALID_REFRESH_TOKEN, ERROR_MESSAGE.INVALID_REFRESH_TOKEN)
    }

    if (session.isRevoked || session.expiresAt <= new Date()) {
      throw new AppError(401, ERROR_CODE.INVALID_REFRESH_TOKEN, ERROR_MESSAGE.INVALID_REFRESH_TOKEN)
    }

    if (session.user.status === UserStatus.banned) {
      await this.repository.revokeSession(session.id)
      throw new AppError(403, ERROR_CODE.ACCOUNT_BANNED, ERROR_MESSAGE.ACCOUNT_BANNED)
    }

    return session
  }

  private async ensureRefreshTokenCanRotate(
    refreshToken: string,
    session: AuthSessionWithUserRecord
  ): Promise<void> {
    const isCurrentRefreshToken = await this.passwordHasher.verifyPassword(
      refreshToken,
      session.refreshTokenHash
    )

    if (!isCurrentRefreshToken) {
      const isPreviousRefreshToken =
        session.previousRefreshTokenHash !== null &&
        (await this.passwordHasher.verifyPassword(refreshToken, session.previousRefreshTokenHash))

      if (!isPreviousRefreshToken) {
        throw new AppError(
          401,
          ERROR_CODE.INVALID_REFRESH_TOKEN,
          ERROR_MESSAGE.INVALID_REFRESH_TOKEN
        )
      }

      if (!isWithinRefreshTokenRetryGrace(session.previousTokenRotatedAt)) {
        await this.repository.revokeSession(session.id)
        throw new AppError(401, ERROR_CODE.REFRESH_TOKEN_REUSED, ERROR_MESSAGE.REFRESH_TOKEN_REUSED)
      }
    }
  }

  async register(input: RegisterDto): Promise<RegisterResponseDto> {
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
    const mappedUser = mapUserAvatar(user)

    return {
      id: mappedUser.id,
      email: mappedUser.email,
      fullName: mappedUser.fullName,
      avatarMediaId: mappedUser.avatarMediaId,
      avatarUrl: mappedUser.avatarUrl,
      role: UserRole.student,
      status: UserStatus.active
    }
  }

  async login(input: LoginDto): Promise<LoginResponseDto> {
    const user = await this.repository.findUserByEmail(input.email)

    if (!user) {
      throw new AppError(401, ERROR_CODE.INVALID_CREDENTIALS, ERROR_MESSAGE.INVALID_CREDENTIALS)
    }

    const isPasswordValid = await this.passwordHasher.verifyPassword(
      input.password,
      user.passwordHash
    )

    if (!isPasswordValid) {
      throw new AppError(401, ERROR_CODE.INVALID_CREDENTIALS, ERROR_MESSAGE.INVALID_CREDENTIALS)
    }

    if (user.status === UserStatus.banned) {
      throw new AppError(403, ERROR_CODE.ACCOUNT_BANNED, ERROR_MESSAGE.ACCOUNT_BANNED)
    }

    if (user.status === UserStatus.pending_verification) {
      throw new AppError(403, ERROR_CODE.ACCOUNT_NOT_VERIFIED, ERROR_MESSAGE.ACCOUNT_NOT_VERIFIED)
    }

    const tokens = await this.tokenService.createLoginTokens({ userId: user.id, role: user.role })
    const mappedUser = mapUserAvatar(user)

    await this.repository.createSession({
      id: tokens.sessionId,
      userId: user.id,
      refreshTokenHash: tokens.refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiresAt
    })

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: mappedUser.id,
        email: mappedUser.email,
        fullName: mappedUser.fullName,
        avatarMediaId: mappedUser.avatarMediaId,
        avatarUrl: mappedUser.avatarUrl,
        role: mappedUser.role,
        status: mappedUser.status
      }
    }
  }

  /**
   * Refreshes the access token using a valid refresh token
   * The function performs the following steps:
   * 1. Verifies the provided refresh token and decodes its payload
   * 2. Checks if the token type in the payload is "refresh"
   * 3. Retrieves the session from the database using the sessionId from the payload
   * 4. Validates the session by checking if it exists, is not revoked, and has not expired
   * 5. If the user associated with the session is banned, revokes the session and throws an error
   * 6. Verifies that the provided refresh token matches either the current or previous refresh token hash stored in the session within the allowed retry grace period to prevent token reuse attacks
   * 7. If valid, creates new access and refresh tokens, rotates the refresh token in the database, and returns the new tokens
   * @param input
   * @returns An object containing the new access token and refresh token
   * @throws AppError with appropriate status code and error message for various failure scenarios (e.g., invalid token, account banned, token reuse)
   */
  async refreshToken(input: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    const payload = await this.verifyRefreshPayload(input.refreshToken)

    const rawSession = await this.repository.findSessionById(payload.sessionId)
    const session = await this.ensureSessionValid(rawSession, payload)

    await this.ensureRefreshTokenCanRotate(input.refreshToken, session)

    const tokens = await this.tokenService.createLoginTokens({
      userId: session.user.id,
      role: session.user.role,
      sessionId: session.id
    })

    await this.repository.rotateSessionRefreshToken({
      id: session.id,
      refreshTokenHash: tokens.refreshTokenHash,
      previousRefreshTokenHash: session.refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiresAt
    })

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  }
}

export const authService = new AuthService(
  authRepository,
  new BcryptPasswordHasherAdapter(),
  new JwtTokenServiceAdapter()
)
