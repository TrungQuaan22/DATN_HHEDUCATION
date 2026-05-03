export const authConfig = {
  password: {
    saltRounds: Number(process.env.AUTH_PASSWORD_SALT_ROUNDS ?? 10),
  },
  refreshToken: {
    retryGraceSeconds: Number(process.env.AUTH_REFRESH_TOKEN_RETRY_GRACE_SECONDS ?? 10),
  },
} as const;
