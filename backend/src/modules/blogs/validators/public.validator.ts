import z from 'zod'

const queryBooleanSchema = z.preprocess((value) => {
  if (value === 'true') return true
  if (value === 'false') return false
  return value
}, z.boolean())

export const listPublicBlogPostsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    categorySlug: z.string().trim().min(1).max(100).optional(),
    tag: z.string().trim().min(1).max(50).optional(),
    featured: queryBooleanSchema.optional(),
    search: z.string().trim().min(1).max(100).optional()
  })
  .strict()

export const listPublicBlogPostsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: listPublicBlogPostsQuerySchema
})

export const listPublicBlogTagsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z
    .object({
      limit: z.coerce.number().int().min(1).max(50).default(5)
    })
    .strict()
})

export const listPublicBlogCategoriesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z
    .object({
      limit: z.coerce.number().int().min(1).max(50).default(5)
    })
    .strict()
})

export const getPublicBlogPostSchema = z.object({
  body: z.object({}).optional(),
  params: z
    .object({
      slug: z.string().trim().min(2).max(255)
    })
    .strict(),
  query: z.object({}).optional()
})
