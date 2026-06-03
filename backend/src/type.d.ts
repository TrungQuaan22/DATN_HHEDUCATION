import type { UserRole } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      requestId?: string
      rawBody?: Buffer
      validated?: {
        body?: unknown
        query?: unknown
        params?: unknown
      }
      user?: {
        id: string
        role: UserRole
        sessionId: string
      }
      idempotency?: {
        scope: string
        key: string
        requestHash: string
      }
    }
  }
}
export {}
