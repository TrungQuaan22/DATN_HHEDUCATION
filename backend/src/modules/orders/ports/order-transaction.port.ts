import type { OrderRepositoryPort } from './order-repository.port'

export type OrderTransactionOperation<T> = (repository: OrderRepositoryPort) => Promise<T>

export interface OrderTransactionPort {
  run<T>(operation: OrderTransactionOperation<T>): Promise<T>
}
