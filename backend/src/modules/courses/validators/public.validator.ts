import z from 'zod'

import { GRADE_VALUES, SUBJECT_VALUES } from '~/common/constant/taxonomy'

const catalogSortSchema = z.enum(['newest', 'hotest', 'priceAsc', 'priceDesc'])
const queryBooleanSchema = z.preprocess((value) => {
  if (value === 'true') return true
  if (value === 'false') return false
  return value
}, z.boolean())
const subjectsQuerySchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return value
}, z.array(z.enum(SUBJECT_VALUES)).min(1).max(SUBJECT_VALUES.length))

export const listCatalogCoursesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).max(100).optional(),
    subjects: subjectsQuerySchema.optional(),
    featured: queryBooleanSchema.optional(),
    grade: z.coerce
      .number()
      .int()
      .refine((value) => GRADE_VALUES.includes(value as (typeof GRADE_VALUES)[number]), {
        message: 'Grade must be one of from 1 to 12'
      })
      .optional(),
    sort: catalogSortSchema.default('newest')
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
