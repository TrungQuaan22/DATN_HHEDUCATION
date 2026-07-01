import z from 'zod'

export const updateMeBodySchema = z
  .object({
    fullName: z.string().trim().min(2).max(100).optional(),
    avatarMediaId: z.string().uuid().optional().nullable()
  })
  .strict()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required'
  })

export const updateMeSchema = z.object({
  body: updateMeBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional()
})
