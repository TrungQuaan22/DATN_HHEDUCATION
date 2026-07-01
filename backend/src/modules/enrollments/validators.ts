import z from 'zod'

export const createManualEnrollmentBodySchema = z
  .object({
    courseId: z.string().uuid(),
    userId: z.string().uuid(),
    manualReason: z.string().trim().min(1).max(500).optional()
  })
  .strict()

export const createManualEnrollmentSchema = z.object({
  body: createManualEnrollmentBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional()
})
