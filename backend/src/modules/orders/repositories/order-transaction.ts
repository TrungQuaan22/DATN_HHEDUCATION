import { prisma } from '~/config/db'

import type {
  OrderTransactionOperation,
  OrderTransactionPort
} from '../ports/order-transaction.port'
import { PrismaOrderRepository } from './order.repository'
import { Prisma } from '@prisma/client'

export class PrismaOrderTransaction implements OrderTransactionPort {
  // Prisma tự động commit khi callback thành công và rollback khi callback phát sinh lỗi.
  // Khi callback được OrderService truyền vào, nó sẽ nhận vào Order Repository dùng transactionClient để mọi câu query chạy trong cùng transaction.
  run<T>(operation: OrderTransactionOperation<T>): Promise<T> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {

      const transactionRepository = new PrismaOrderRepository(tx)

      // Thực thi callback nghiệp vụ được OrderService truyền vào.
      const operationResult = await operation(transactionRepository)

      return operationResult
    })
  }
}

export const orderTransaction = new PrismaOrderTransaction()
