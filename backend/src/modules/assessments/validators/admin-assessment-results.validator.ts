import z from 'zod'

export const assessmentParticipantStatusSchema = z.enum([
  'not_started',
  'doing',
  'pending_grading',
  'completed'
])

const assessmentIdParams = z.object({ assessmentId: z.string().uuid() }).strict()

export const listAssessmentResultsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).max(100).optional(),
    status: assessmentParticipantStatusSchema.optional()
  })
  .strict()

export const listAssessmentResultsSchema = z.object({
  body: z.object({}).optional(),
  params: assessmentIdParams,
  query: listAssessmentResultsQuerySchema
})

export const getAssessmentStudentAttemptsSchema = z.object({
  body: z.object({}).optional(),
  params: assessmentIdParams
    .extend({
      studentId: z.string().uuid()
    })
    .strict(),
  query: z.object({}).optional()
})
