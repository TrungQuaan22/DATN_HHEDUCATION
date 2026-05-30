import { S3Client } from '@aws-sdk/client-s3'

const getRequiredEnv = (key: string): string => {
  const value = process.env[key]

  if (!value) {
    throw new Error(`${key} is required`)
  }

  return value
}

const accessKeyId = getRequiredEnv('R2_ACCESS_KEY_ID')
const secretAccessKey = getRequiredEnv('R2_SECRET_ACCESS_KEY')
const endpoint = getRequiredEnv('R2_ENDPOINT')

export const r2Config = {
  bucketName: getRequiredEnv('R2_BUCKET_NAME'),
  presignedUrlExpiresInSeconds: Number(process.env.R2_PRESIGNED_URL_EXPIRES_IN ?? 300),
  publicBaseUrl: process.env.R2_PUBLIC_BASE_URL ?? null
} as const

export const r2Client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey
  },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED'
})
