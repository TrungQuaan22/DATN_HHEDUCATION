import type { SignOptions } from 'jsonwebtoken'

const getRequiredEnv = (key: string): string => {
  const value = process.env[key]

  if (!value) {
    throw new Error(`${key} is required`)
  }

  return value
}

export const jwtConfig = {
  accessToken: {
    privateKey: getRequiredEnv('JWT_ACCESS_SECRET'),
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as SignOptions['expiresIn']
  },
  refreshToken: {
    privateKey: getRequiredEnv('JWT_REFRESH_SECRET'),
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as SignOptions['expiresIn']
  }
} as const
