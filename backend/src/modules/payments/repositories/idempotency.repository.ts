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

  findByScopeAndKey(data: { scope: string; key: string }) {
    return prisma.idempotencyKey.findUnique({
      where: {
        scope_key: data
      }
    })
  }

  async markProcessing(data: { scope: string; key: string; processingAt: Date }): Promise<void> {
    await prisma.idempotencyKey.update({
      where: {
        scope_key: {
          scope: data.scope,
          key: data.key
        }
      },
      data: {
        processingAt: data.processingAt
      }
    })
  }

  async deleteByScopeAndKey(data: { scope: string; key: string }): Promise<void> {
    await prisma.idempotencyKey
      .delete({
        where: {
          scope_key: data
        }
      })
      .catch(() => undefined)
  }

  async saveResponse(data: {
    scope: string
    key: string
    statusCode: number
    responseBody: unknown
  }): Promise<void> {
    await prisma.idempotencyKey.update({
      where: {
        scope_key: {
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
