import { UserRole } from "@prisma/client";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { TokenType } from "~/common/constant/enums";

export type JwtPayload = Record<string, unknown>;

export type JwtSignInput<TPayload extends JwtPayload> = {
  payload: TPayload;
  privateKey: Secret;
  options?: SignOptions;
};

export type AccessTokenPayload = {
  tokenType: TokenType.ACCESS;
  userId: string;
  role: UserRole;
  sessionId: string;
};

export type RefreshTokenPayload = {
  tokenType: TokenType.REFRESH;
  userId: string;
  sessionId: string;
};

const signJwt = <TPayload extends JwtPayload>({
  payload,
  privateKey,
  options,
}: JwtSignInput<TPayload>): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, privateKey, options ?? {}, (error, token) => {
      if (error) {
        reject(error);
        return;
      }

      if (!token) {
        reject(new Error("JWT signing failed"));
        return;
      }

      resolve(token);
    });
  });
};

export const signAccessToken = (input: JwtSignInput<AccessTokenPayload>): Promise<string> => {
  return signJwt(input);
};

export const signRefreshToken = (input: JwtSignInput<RefreshTokenPayload>): Promise<string> => {
  return signJwt(input);
};

const verifyJwt = <TPayload extends JwtPayload>({
  token,
  privateKey,
}: {
  token: string;
  privateKey: Secret;
}): Promise<TPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, privateKey, (error, decoded) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(decoded as TPayload);
    });
  });
};

export const verifyRefreshToken = (input: {
  token: string;
  privateKey: Secret;
}): Promise<RefreshTokenPayload> => {
  return verifyJwt<RefreshTokenPayload>(input);
};

export const verifyAccessToken = (input: {
  token: string;
  privateKey: Secret;
}): Promise<AccessTokenPayload> => {
  return verifyJwt<AccessTokenPayload>(input);
};
