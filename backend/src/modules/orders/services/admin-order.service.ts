import type { Prisma } from '@prisma/client'

import { AppError } from '~/common/error/app-error'
import { ERROR_CODE } from '~/common/constant/error-code'
import type {
  AdminOrderDetailDto,
  ListAdminOrdersDto,
  ListAdminOrdersResponseDto
} from '../dto'
import { adminOrderRepository } from '../repositories/admin-order.repository'
import type { AdminOrderRepositoryPort } from '../ports/admin-order-repository.port'

const buildOrderWhere = (input: ListAdminOrdersDto): Prisma.OrderWhereInput => {
  const where: Prisma.OrderWhereInput = {
    status: input.status,
    userId: input.userId
  }

  if (input.createdFrom || input.createdTo) {
    where.createdAt = {
      gte: input.createdFrom,
      lte: input.createdTo
    }
  }

  if (input.paymentStatus || input.provider) {
    where.payments = {
      some: {
        status: input.paymentStatus,
        provider: input.provider
      }
    }
  }

  if (input.search) {
    where.OR = [
      {
        orderInvoiceNumber: {
          contains: input.search,
          mode: 'insensitive'
        }
      },
      {
        user: {
          email: {
            contains: input.search,
            mode: 'insensitive'
          }
        }
      },
      {
        user: {
          fullName: {
            contains: input.search,
            mode: 'insensitive'
          }
        }
      }
    ]
  }

  return where
}

export class AdminOrderService {
  constructor(private readonly orderRepository: AdminOrderRepositoryPort) {}

  async listOrders(input: ListAdminOrdersDto): Promise<ListAdminOrdersResponseDto> {
    const where = buildOrderWhere(input)
    const skip = (input.page - 1) * input.limit

    const [items, totalItems] = await this.orderRepository.listOrders({
      where,
      skip,
      take: input.limit
    })

    return {
      items,
      pagination: {
        page: input.page,
        limit: input.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / input.limit)
      }
    }
  }

  async getOrder(orderId: string): Promise<AdminOrderDetailDto> {
    const order = await this.orderRepository.getOrderById(orderId)
    if (!order) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Order not found')
    }
    return order
  }
}

export const adminOrderService = new AdminOrderService(adminOrderRepository)
