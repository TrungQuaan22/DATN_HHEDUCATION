import { AppError } from '~/common/error/app-error'
import { ERROR_CODE } from '~/common/constant/error-code'
import type { AdminOrderDetailResponse, ListAdminOrdersDto, ListAdminOrdersResponse } from '../dto'
import { adminOrderRepository } from '../repositories/admin-order.repository'
import type { AdminOrderRepositoryPort } from '../ports/admin-order-repository.port'
import { mapAdminOrderDetail, mapAdminOrderListItem } from '../mappers/admin-order.mapper'

export class AdminOrderService {
  constructor(private readonly orderRepository: AdminOrderRepositoryPort) {}

  async listOrders(input: ListAdminOrdersDto): Promise<ListAdminOrdersResponse> {
    const [items, totalItems] = await this.orderRepository.listOrders({
      filters: {
        status: input.status,
        userId: input.userId,
        createdFrom: input.createdFrom,
        createdTo: input.createdTo,
        paymentStatus: input.paymentStatus,
        provider: input.provider,
        search: input.search
      },
      page: input.page,
      limit: input.limit
    })

    return {
      items: items.map(mapAdminOrderListItem),
      pagination: {
        page: input.page,
        limit: input.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / input.limit)
      }
    }
  }

  async getOrder(orderId: string): Promise<AdminOrderDetailResponse> {
    const order = await this.orderRepository.getOrderById(orderId)
    if (!order) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Order not found')
    }
    return mapAdminOrderDetail(order)
  }
}

export const adminOrderService = new AdminOrderService(adminOrderRepository)
