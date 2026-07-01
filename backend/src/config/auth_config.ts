export const authConfig = {
  password: {
    saltRounds: Number(process.env.AUTH_PASSWORD_SALT_ROUNDS ?? 10)
  }
} as const
