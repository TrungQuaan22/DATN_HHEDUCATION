import z from 'zod'

const courseIdParamSchema = z
  .object({
    courseId: z.string().uuid()
  })
  .strict()

const chapterIdParamSchema = z
  .object({
    chapterId: z.string().uuid()
  })
  .strict()

export const createChapterBodySchema = z
  .object({
    title: z.string().trim().min(2).max(255)
  })
  .strict()

export const createChapterSchema = z.object({
  body: createChapterBodySchema,
  params: courseIdParamSchema,
  query: z.object({}).optional()
})

export const updateChapterBodySchema = z
  .object({
    title: z.string().trim().min(2).max(255)
  })
  .strict()

export const updateChapterSchema = z.object({
  body: updateChapterBodySchema,
  params: chapterIdParamSchema,
  query: z.object({}).optional()
})

export const deleteChapterSchema = z.object({
  body: z.object({}).optional(),
  params: chapterIdParamSchema,
  query: z.object({}).optional()
})

export const reorderChaptersBodySchema = z
  .object({
    chapterIds: z.array(z.string().uuid()).min(1)
  })
  .strict()

export const reorderChaptersSchema = z.object({
  body: reorderChaptersBodySchema,
  params: courseIdParamSchema,
  query: z.object({}).optional()
})
