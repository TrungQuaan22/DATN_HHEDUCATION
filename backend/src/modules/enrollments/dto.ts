import z from 'zod'

import { createManualEnrollmentBodySchema } from './validators'

export type CreateManualEnrollmentDto = z.infer<typeof createManualEnrollmentBodySchema>

export type ManualEnrollmentResponseDto = {
  id: string
  courseId: string
  userId: string
  source: 'manual'
  orderId: null
  manualReason: string | null
  enrolledAt: Date
}
