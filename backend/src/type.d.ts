import type { UserRole } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      requestId?: string
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
    }
  }
}
export {}
