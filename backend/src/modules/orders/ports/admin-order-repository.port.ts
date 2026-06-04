import type { Prisma } from '@prisma/client'

import type { AdminOrderDetailDto, AdminOrderListItemDto } from '../dto'

export interface AdminOrderRepositoryPort {
  listOrders(data: {
    where: Prisma.OrderWhereInput
    skip: number
    take: number
  }): Promise<[AdminOrderListItemDto[], number]>
  getOrderById(orderId: string): Promise<AdminOrderDetailDto | null>
}
