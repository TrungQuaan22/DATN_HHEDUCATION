import { prisma } from '~/config/db'

import type {
  OrderTransactionOperation,
  OrderTransactionPort
} from '../ports/order-transaction.port'
import { PrismaOrderRepository } from './order.repository'

export class PrismaOrderTransaction implements OrderTransactionPort {
  run<T>(operation: OrderTransactionOperation<T>): Promise<T> {
    // Prisma commit khi callback thành công và rollback khi callback ném lỗi.
    return prisma.$transaction(async (tx) => {
      // Repository này bảo đảm mọi query của operation dùng chung transaction.
      const transactionRepository = new PrismaOrderRepository(tx)

      const operationResult = await operation(transactionRepository)

      return operationResult
    })
  }
}

export const orderTransaction = new PrismaOrderTransaction()
