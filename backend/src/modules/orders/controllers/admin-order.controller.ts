import type { Request, Response } from 'express'
import z from 'zod'

import { sendSuccess } from '~/common/http/response'

import {
  type AdminOrderService,
  adminOrderService
} from '../services/admin-order.service'
import {
  getAdminOrderSchema,
  listAdminOrdersSchema
} from '../validators/admin-order.validator'

type ListAdminOrdersValidated = z.infer<typeof listAdminOrdersSchema>
type GetAdminOrderValidated = z.infer<typeof getAdminOrderSchema>

export class AdminOrderController {
  constructor(private readonly service: AdminOrderService) {}

  listOrders = async (req: Request, res: Response) => {
    const validated = req.validated as ListAdminOrdersValidated
    const data = await this.service.listOrders(validated.query)

    sendSuccess({ res, data })
  }

  getOrder = async (req: Request, res: Response) => {
    const validated = req.validated as GetAdminOrderValidated
    const data = await this.service.getOrder(validated.params.orderId)

    sendSuccess({ res, data })
  }
}

export const adminOrderController = new AdminOrderController(adminOrderService)

export const listAdminOrdersController = adminOrderController.listOrders
export const getAdminOrderController = adminOrderController.getOrder
