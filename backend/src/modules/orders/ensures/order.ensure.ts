import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

export function ensureOrderExists<T>(order: T | null): asserts order is T {
  if (!order) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Order not found')
  }
}

export function ensureReloadedOrderExists<T>(order: T | null): asserts order is T {
  if (!order) {
    throw new AppError(500, ERROR_CODE.INTERNAL_SERVER_ERROR, 'Order could not be reloaded')
  }
}
