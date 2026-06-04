import { prisma } from '~/config/db'

import { ADMIN_ORDER_DETAIL_SELECT, ADMIN_ORDER_LIST_SELECT } from '../dto'
import type { AdminOrderRepositoryPort } from '../ports/admin-order-repository.port'

export class PrismaAdminOrderRepository implements AdminOrderRepositoryPort {
  async listOrders(data: Parameters<AdminOrderRepositoryPort['listOrders']>[0]) {
    return prisma.$transaction([
      prisma.order.findMany({
        where: data.where,
        select: ADMIN_ORDER_LIST_SELECT,
        orderBy: {
          createdAt: 'desc'
        },
        skip: data.skip,
        take: data.take
      }),
      prisma.order.count({
        where: data.where
      })
    ])
  }

  getOrderById(orderId: string) {
    return prisma.order.findUnique({
      where: {
        id: orderId
      },
      select: ADMIN_ORDER_DETAIL_SELECT
    })
  }
}

export const adminOrderRepository = new PrismaAdminOrderRepository()
