import type {
  LoginDto,
  LoginResponse,
  RefreshTokenDto,
  RefreshTokenResponse,
  RegisterDto,
  RegisterResponse
} from './dto'
import { authRepository } from './repository'
import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { isWithinRefreshTokenRetryGrace, type RefreshTokenPayload } from './utils'
import { TokenType } from '~/common/constant/enums'
import { UserRole, UserStatus } from '@prisma/client'
import { mapAuthUserToLoginUser, mapAuthUserToRegisterResponse } from './mappers/auth.mapper'
import type {
  AuthRepositoryPort,
  AuthSessionWithUserRecord
} from './ports/auth-repository.port'
import type { PasswordHasherPort } from './ports/password-hasher.port'
import type { TokenServicePort } from './ports/token-service.port'
import { BcryptPasswordHasherAdapter } from './adapters/bcrypt-password-hasher.adapter'
import { JwtTokenServiceAdapter } from './adapters/jwt-token-service.adapter'
import { User } from './entities/user.entity'
import { AuthSession } from './entities/auth-session.entity'

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

    const user = new User(userRecord)
    user.ensureCanLogin()

    const tokens = await this.tokenService.createLoginTokens({ userId: user.id, role: user.role })
    const loginUser = mapAuthUserToLoginUser(userRecord)

    await this.repository.createSession({
      id: tokens.sessionId,
      userId: user.id,
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

    const session = new AuthSession(rawSession)
    session.ensureValid(payload.userId)

    if (session.isUserBanned()) {
      await this.repository.revokeSession(session.id)
      throw new AppError(403, ERROR_CODE.ACCOUNT_BANNED, ERROR_MESSAGE.ACCOUNT_BANNED)
    }

    const verifyFn = (password: string, hash: string) => this.passwordHasher.verifyPassword(password, hash)
    const rotationResult = await session.verifyAndRotateToken(input.refreshToken, verifyFn)

    if (rotationResult.mustRevokeSession) {
      await this.repository.revokeSession(session.id)
      throw new AppError(401, ERROR_CODE.REFRESH_TOKEN_REUSED, ERROR_MESSAGE.REFRESH_TOKEN_REUSED)
    }

    const tokens = await this.tokenService.createLoginTokens({
      userId: session.userId,
      role: rawSession.user.role,
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
