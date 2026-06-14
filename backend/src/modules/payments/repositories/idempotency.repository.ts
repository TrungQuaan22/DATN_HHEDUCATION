import { Prisma } from '@prisma/client'

import { prisma } from '~/config/db'

import type { IdempotencyRepositoryPort } from '../ports/idempotency-repository.port'

const toJsonValue = (value: unknown): Prisma.InputJsonValue => {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

export class PrismaIdempotencyRepository implements IdempotencyRepositoryPort {
  async tryCreateProcessingKey(data: {
    scope: string
    key: string
    userId: string
    requestHash: string
    processingAt: Date
    expiresAt: Date
  }): Promise<boolean> {
    try {
      await prisma.idempotencyKey.create({
        data
      })
      return true
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return false
      }

      throw error
    }
  }

  findByScopeKeyAndUser(data: { scope: string; key: string; userId: string }) {
    return prisma.idempotencyKey.findUnique({
      where: {
        userId_scope_key: {
          userId: data.userId,
          scope: data.scope,
          key: data.key
        }
      }
    })
  }

  async markProcessing(data: {
    scope: string
    key: string
    userId: string
    processingAt: Date
    staleProcessingAt: Date | null
  }): Promise<boolean> {
    const result = await prisma.idempotencyKey.updateMany({
      where: {
        userId: data.userId,
        scope: data.scope,
        key: data.key,
        processingAt: data.staleProcessingAt,
        statusCode: null
      },
      data: {
        processingAt: data.processingAt
      }
    })
    return result.count === 1
  }

  async deleteByScopeKeyAndUser(data: { scope: string; key: string; userId: string }): Promise<void> {
    await prisma.idempotencyKey
      .delete({
        where: {
          userId_scope_key: {
            userId: data.userId,
            scope: data.scope,
            key: data.key
          }
        }
      })
      .catch(() => undefined)
  }

  async saveResponse(data: {
    scope: string
    key: string
    userId: string
    statusCode: number
    responseBody: unknown
  }): Promise<void> {
    await prisma.idempotencyKey.update({
      where: {
        userId_scope_key: {
          userId: data.userId,
          scope: data.scope,
          key: data.key
        }
      },
      data: {
        statusCode: data.statusCode,
        responseBody: toJsonValue(data.responseBody),
        processingAt: null
      }
    })
  }
}

export const idempotencyRepository = new PrismaIdempotencyRepository()
