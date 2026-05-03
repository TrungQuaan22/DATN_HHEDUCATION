import type {
  LoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  RegisterDto,
  RegisterResponseDto,
} from "./dto";
import { authRepository } from "./repository";
import { ERROR_CODE } from "~/common/constant/error-code";
import { ERROR_MESSAGE } from "~/common/constant/error-message";
import { AppError } from "~/common/error/app-error";
import { jwtConfig } from "~/config/jwt_config";
import { hashPassword, verifyPassword } from "./utils/password";
import { createLoginTokens, isWithinRefreshTokenRetryGrace } from "./utils/token";
import { UserRole, UserStatus } from "@prisma/client";
import { verifyRefreshToken } from "./utils/jwt";
import { TokenType } from "~/common/constant/enums";


export const authService = {
  async register(input: RegisterDto): Promise<RegisterResponseDto> {
    const existed = await authRepository.findUserByEmail(input.email);

    if (existed) {
      throw new AppError(409, ERROR_CODE.EMAIL_ALREADY_EXISTS, ERROR_MESSAGE.EMAIL_ALREADY_EXISTS);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createStudent({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: UserRole.student,
      status: UserStatus.active,
    };
  },

  async login(input: LoginDto): Promise<LoginResponseDto> {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user) {
      throw new AppError(401, ERROR_CODE.INVALID_CREDENTIALS, ERROR_MESSAGE.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await verifyPassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError(401, ERROR_CODE.INVALID_CREDENTIALS, ERROR_MESSAGE.INVALID_CREDENTIALS);
    }

    if (user.status === UserStatus.banned) {
      throw new AppError(403, ERROR_CODE.ACCOUNT_BANNED, ERROR_MESSAGE.ACCOUNT_BANNED);
    }

    if (user.status === UserStatus.pending_verification) {
      throw new AppError(403, ERROR_CODE.ACCOUNT_NOT_VERIFIED, ERROR_MESSAGE.ACCOUNT_NOT_VERIFIED);
    }

    const tokens = await createLoginTokens({ userId: user.id, role: user.role });

    await authRepository.createSession({
      id: tokens.sessionId,
      userId: user.id,
      refreshTokenHash: tokens.refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiresAt,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    };
  },

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
    let payload;
    // Verify and decode token and get payload
    try {
      payload = await verifyRefreshToken({
        token: input.refreshToken,
        privateKey: jwtConfig.refreshToken.privateKey,
      });
    } catch {
      throw new AppError(401, ERROR_CODE.INVALID_REFRESH_TOKEN, ERROR_MESSAGE.INVALID_REFRESH_TOKEN);
    }
    //Check token type
    if (payload.tokenType !== TokenType.REFRESH) {
      throw new AppError(401, ERROR_CODE.INVALID_REFRESH_TOKEN, ERROR_MESSAGE.INVALID_REFRESH_TOKEN);
    }

    //get session from db using sessionId in payload
    const session = await authRepository.findSessionById(payload.sessionId);

    if (!session || session.userId !== payload.userId) {
      throw new AppError(401, ERROR_CODE.INVALID_REFRESH_TOKEN, ERROR_MESSAGE.INVALID_REFRESH_TOKEN);
    }

    if (session.isRevoked || session.expiresAt <= new Date()) {
      throw new AppError(401, ERROR_CODE.INVALID_REFRESH_TOKEN, ERROR_MESSAGE.INVALID_REFRESH_TOKEN);
    }

    if (session.user.status === UserStatus.banned) {
      await authRepository.revokeSession(session.id);
      throw new AppError(403, ERROR_CODE.ACCOUNT_BANNED, ERROR_MESSAGE.ACCOUNT_BANNED);
    }

    const isCurrentRefreshToken = await verifyPassword(input.refreshToken, session.refreshTokenHash);

    if (!isCurrentRefreshToken) {
      const isPreviousRefreshToken =
        session.previousRefreshTokenHash !== null &&
        (await verifyPassword(input.refreshToken, session.previousRefreshTokenHash));

      if (!isPreviousRefreshToken) {
        throw new AppError(401, ERROR_CODE.INVALID_REFRESH_TOKEN, ERROR_MESSAGE.INVALID_REFRESH_TOKEN);
      }

      if (!isWithinRefreshTokenRetryGrace(session.previousTokenRotatedAt)) {
        await authRepository.revokeSession(session.id);
        throw new AppError(401, ERROR_CODE.REFRESH_TOKEN_REUSED, ERROR_MESSAGE.REFRESH_TOKEN_REUSED);
      }
    }

    const tokens = await createLoginTokens({
      userId: session.user.id,
      role: session.user.role,
      sessionId: session.id,
    });

    await authRepository.rotateSessionRefreshToken({
      id: session.id,
      refreshTokenHash: tokens.refreshTokenHash,
      previousRefreshTokenHash: session.refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiresAt,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  },
};
