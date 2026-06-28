import z from 'zod'

const uuidSchema = z.string().uuid()

export const listNotificationsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).strict(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    unreadOnly: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .default('false')
  })
})

export const notificationIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ notificationId: uuidSchema }).strict(),
  query: z.object({}).optional()
})

export const emptyNotificationSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).strict(),
  query: z.object({}).optional()
})
