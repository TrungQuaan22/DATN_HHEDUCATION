import z from 'zod'

const uuidSchema = z.string().uuid()

export const createTutorSessionBodySchema = z
  .object({
    courseId: uuidSchema,
    lessonId: uuidSchema.optional().nullable()
  })
  .strict()

export const sendTutorMessageBodySchema = z
  .object({
    message: z.string().trim().min(1).max(4000),
    lessonId: uuidSchema.optional().nullable()
  })
  .strict()

export const listTutorSessionsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).strict(),
  query: z
    .object({
      courseId: uuidSchema.optional(),
      lessonId: uuidSchema.optional().nullable()
    })
    .strict()
})

export const createTutorSessionSchema = z.object({
  body: createTutorSessionBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional()
})

export const tutorSessionIdSchema = z.object({
  body: z.object({}).optional(),
  params: z
    .object({
      sessionId: uuidSchema
    })
    .strict(),
  query: z.object({}).optional()
})

export const sendTutorMessageSchema = z.object({
  body: sendTutorMessageBodySchema,
  params: z
    .object({
      sessionId: uuidSchema
    })
    .strict(),
  query: z.object({}).optional()
})
