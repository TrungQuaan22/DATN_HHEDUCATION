export const aiServiceConfig = {
  baseUrl: process.env.AI_SERVICE_URL ?? 'http://localhost:8000',
  internalToken: process.env.AI_SERVICE_INTERNAL_TOKEN ?? null,
  requestTimeoutMs: Number(process.env.AI_SERVICE_REQUEST_TIMEOUT_MS ?? 120000)
} as const
