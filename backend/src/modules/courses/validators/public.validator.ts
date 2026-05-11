import z from 'zod'

export const listCatalogCoursesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).max(100).optional()
  })
  .strict()

export const listCatalogCoursesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: listCatalogCoursesQuerySchema
})

export const getCatalogCourseSchema = z.object({
  body: z.object({}).optional(),
  params: z
    .object({
      courseSlug: z.string().trim().min(2).max(255)
    })
    .strict(),
  query: z.object({}).optional()
})
