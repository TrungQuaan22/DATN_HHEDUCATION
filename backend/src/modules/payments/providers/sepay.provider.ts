import { createHmac, timingSafeEqual } from 'crypto'
import type { Request } from 'express'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

import { sepayConfig } from '../config'
import type { NormalizedPaymentEvent } from '../dto'
import type { PaymentProvider } from './provider.interface'

type SePayWebhookPayload = {
  id?: number | string
  gateway?: string
  transactionDate?: string
  accountNumber?: string
  subAccount?: string
  code?: string | null
  content?: string
  transferType?: string
  description?: string
  transferAmount?: number
  accumulated?: number
  referenceCode?: string
}

const ensureQrConfig = () => {
  if (!sepayConfig.bankAccountNumber || !sepayConfig.bankCode) {
    throw new AppError(
      500,
      ERROR_CODE.INTERNAL_SERVER_ERROR,
      'SePay bank account config is missing'
    )
  }
}

const parseVietnamDate = (value: string | undefined): Date | null => {
  if (!value) return null

  const isoLike = value.replace(' ', 'T')
  const parsed = new Date(`${isoLike}+07:00`)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const verifyApiKey = (req: Request) => {
  if (!sepayConfig.apiKey) {
    throw new AppError(500, ERROR_CODE.INTERNAL_SERVER_ERROR, 'SePay API key is missing')
  }

  const expected = `Apikey ${sepayConfig.apiKey}`
  const actual = req.headers.authorization ?? ''

  if (actual.length !== expected.length) {
    throw new AppError(401, ERROR_CODE.UNAUTHORIZED, 'Invalid SePay API key')
  }

  if (!timingSafeEqual(Buffer.from(actual), Buffer.from(expected))) {
    throw new AppError(401, ERROR_CODE.UNAUTHORIZED, 'Invalid SePay API key')
  }
}

const verifyHmac = (req: Request) => {
  if (!sepayConfig.webhookSecret) {
    throw new AppError(500, ERROR_CODE.INTERNAL_SERVER_ERROR, 'SePay webhook secret is missing')
  }

  const rawBody = req.rawBody
  const signature = String(req.headers['x-sepay-signature'] ?? '')
  const timestampHeader = String(req.headers['x-sepay-timestamp'] ?? '')
  const timestamp = Number(timestampHeader)

  if (!rawBody || !signature || !Number.isFinite(timestamp)) {
    throw new AppError(401, ERROR_CODE.UNAUTHORIZED, 'Missing SePay signature')
  }

  const nowSec = Math.floor(Date.now() / 1000)
  if (Math.abs(nowSec - timestamp) > 300) {
    throw new AppError(401, ERROR_CODE.UNAUTHORIZED, 'Expired SePay signature')
  }

  const expected = `sha256=${createHmac('sha256', sepayConfig.webhookSecret)
    .update(`${timestamp}.${rawBody.toString('utf8')}`)
    .digest('hex')}`

  if (signature.length !== expected.length) {
    throw new AppError(401, ERROR_CODE.UNAUTHORIZED, 'Invalid SePay signature')
  }

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new AppError(401, ERROR_CODE.UNAUTHORIZED, 'Invalid SePay signature')
  }
}

const verifyWebhookRequest = (req: Request) => {
  if (sepayConfig.webhookAuthMode === 'none') {
    return
  }

  if (sepayConfig.webhookAuthMode === 'api_key') {
    verifyApiKey(req)
    return
  }

  verifyHmac(req)
}

const normalizePayload = (payload: SePayWebhookPayload): NormalizedPaymentEvent => {
  const eventId = payload.id === undefined || payload.id === null ? null : String(payload.id)
  const amount = Number(payload.transferAmount)

  if (!eventId || !Number.isFinite(amount)) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Invalid SePay webhook payload')
  }

  const transactionRef = payload.referenceCode?.trim() || eventId

  return {
    provider: sepayConfig.provider,
    eventId,
    transactionRef,
    orderInvoiceNumber: payload.code?.trim().toUpperCase() || null,
    amount,
    currency: 'VND',
    status: payload.transferType === 'in' ? 'success' : 'failed',
    direction: payload.transferType === 'in' ? 'in' : 'out',
    paidAt: parseVietnamDate(payload.transactionDate),
    gateway: payload.gateway?.trim() || null,
    accountNumber: payload.accountNumber?.trim() || null,
    rawPayload: payload
  }
}

export const sepayProvider: PaymentProvider = {
  createPayment(input) {
    ensureQrConfig()

    const params = new URLSearchParams({
      acc: sepayConfig.bankAccountNumber!,
      bank: sepayConfig.bankCode!,
      amount: String(input.amount),
      des: input.orderInvoiceNumber
    })

    return {
      provider: sepayConfig.provider,
      providerPaymentId: input.orderInvoiceNumber,
      qrCodeUrl: `${sepayConfig.qrBaseUrl}?${params.toString()}`,
      checkoutUrl: null,
      expiresAt: input.expiresAt
    }
  },

  verifyWebhook(req: Request): NormalizedPaymentEvent {
    verifyWebhookRequest(req)
    return normalizePayload(req.body as SePayWebhookPayload)
  }
}
