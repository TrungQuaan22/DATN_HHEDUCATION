import z from 'zod'

export const courseStudentProgressStatusSchema = z.enum(['not_started', 'in_progress', 'completed'])

const courseIdParamsSchema = z
  .object({
    courseId: z.string().uuid()
  })
  .strict()

export const listAdminCourseStudentsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).max(100).optional(),
    progressStatus: courseStudentProgressStatusSchema.optional()
  })
  .strict()

export const listAdminCourseStudentsSchema = z.object({
  body: z.object({}).optional(),
  params: courseIdParamsSchema,
  query: listAdminCourseStudentsQuerySchema
})

export const getAdminCourseStudentProgressSchema = z.object({
  body: z.object({}).optional(),
  params: courseIdParamsSchema
    .extend({
      studentId: z.string().uuid()
    })
    .strict(),
  query: z.object({}).optional()
})
