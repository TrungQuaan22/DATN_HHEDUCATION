import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'
import { withIdempotency } from '~/common/utils/with-idempotency'
import {
  type OrderService,
  orderService
} from '../services/order.service'
import {
  cancelOrderSchema,
  createPaymentAttemptSchema,
  createOrderSchema,
  getOrderSchema
} from '../validators/order.validator'

type CreateOrderValidated = z.infer<typeof createOrderSchema>
type GetOrderValidated = z.infer<typeof getOrderSchema>
type CancelOrderValidated = z.infer<typeof cancelOrderSchema>
type CreatePaymentAttemptValidated = z.infer<typeof createPaymentAttemptSchema>



export class OrderController {
  constructor(private readonly service: OrderService) {}

  createOrder = async (req: Request) => {
    const validated = req.validated as CreateOrderValidated

    const body = await this.service.createOrder({
      userId: req.user!.id,
      courseIds: validated.body.courseIds
    })

    return {
      statusCode: 201,
      body
    }
  }

  createPaymentAttempt = async (req: Request) => {
    const validated = req.validated as CreatePaymentAttemptValidated

    const body = await this.service.createPaymentAttempt({
      userId: req.user!.id,
      orderId: validated.params.orderId,
      provider: validated.body.provider
    })

    return {
      statusCode: 201,
      body
    }
  }

  getOrder = async (req: Request, res: Response) => {
    const validated = req.validated as GetOrderValidated
    const data = await this.service.getMyOrder({
      userId: req.user!.id,
      orderId: validated.params.orderId
    })

    sendSuccess({ res, data })
  }

  cancelOrder = async (req: Request) => {
    const validated = req.validated as CancelOrderValidated

    const body = await this.service.cancelOrder({
      userId: req.user!.id,
      orderId: validated.params.orderId
    })

    return {
      statusCode: 200,
      body
    }
  }
}

export const orderController = new OrderController(orderService)

export const createOrderController = withIdempotency(orderController.createOrder)
export const createPaymentAttemptController = withIdempotency(orderController.createPaymentAttempt)
export const getOrderController = orderController.getOrder
export const cancelOrderController = withIdempotency(orderController.cancelOrder)
