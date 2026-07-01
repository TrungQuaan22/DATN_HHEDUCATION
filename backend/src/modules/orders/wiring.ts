import { orderPaymentProvider } from './providers/order-payment-provider'
import { adminOrderRepository } from './repositories/admin-order.repository'
import { orderTransaction } from './repositories/order-transaction'
import { AdminOrderService } from './services/admin-order.service'
import { OrderService } from './services/order.service'

export const orderService = new OrderService(orderTransaction, orderPaymentProvider)
export const adminOrderService = new AdminOrderService(adminOrderRepository)
