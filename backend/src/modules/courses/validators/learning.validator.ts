import z from 'zod'

export const getLearningCourseSchema = z.object({
  body: z.object({}).optional(),
  params: z
    .object({
      courseSlug: z.string().trim().min(2).max(255)
    })
    .strict(),
  query: z.object({}).optional()
})
