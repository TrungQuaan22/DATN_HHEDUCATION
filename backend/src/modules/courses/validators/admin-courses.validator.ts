import { CourseStatus } from '@prisma/client'
import z from 'zod'

import { GRADE_VALUES, SUBJECT_VALUES } from '~/common/constant/taxonomy'

const courseIdParamSchema = z
  .object({
    courseId: z.string().uuid()
  })
  .strict()

const coursePriceSchema = z.number().int().min(0)
const gradeSchema = z
  .number()
  .int()
  .refine((value) => GRADE_VALUES.includes(value as (typeof GRADE_VALUES)[number]), {
    message: 'Grade must be one of from 1 to 12'
  })

export const createCourseBodySchema = z
  .object({
    title: z.string().trim().min(2).max(255),
    description: z.string().trim().max(5000).optional(),
    subject: z.enum(SUBJECT_VALUES),
    grade: gradeSchema,
    teacherId: z.string().uuid(),
    thumbnailMediaId: z.string().uuid().optional().nullable(),
    price: coursePriceSchema,
    salePrice: coursePriceSchema.optional().nullable(),
    allowPreview: z.boolean().optional()
  })
  .strict()
  .refine((data) => data.salePrice == null || data.salePrice < data.price, {
    message: 'Sale price must be less than price',
    path: ['salePrice']
  })

export const createCourseSchema = z.object({
  body: createCourseBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional()
})

export const listAdminCoursesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.nativeEnum(CourseStatus).optional(),
    teacherId: z.string().uuid().optional(),
    search: z.string().trim().min(1).max(100).optional()
  })
  .strict()

export const listAdminCoursesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: listAdminCoursesQuerySchema
})

export const getAdminCourseSchema = z.object({
  body: z.object({}).optional(),
  params: courseIdParamSchema,
  query: z.object({}).optional()
})

export const updateCourseBodySchema = z
  .object({
    title: z.string().trim().min(2).max(255).optional(),
    description: z.string().trim().max(5000).optional().nullable(),
    subject: z.enum(SUBJECT_VALUES).optional(),
    grade: gradeSchema.optional(),
    teacherId: z.string().uuid().optional(),
    thumbnailMediaId: z.string().uuid().optional().nullable(),
    price: coursePriceSchema.optional(),
    salePrice: coursePriceSchema.optional().nullable(),
    allowPreview: z.boolean().optional()
  })
  .strict()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required'
  })
  .refine((data) => data.price == null || data.salePrice == null || data.salePrice < data.price, {
    message: 'Sale price must be less than price',
    path: ['salePrice']
  })

export const updateCourseSchema = z.object({
  body: updateCourseBodySchema,
  params: courseIdParamSchema,
  query: z.object({}).optional()
})

export const changeCourseStatusSchema = z.object({
  body: z.object({}).optional(),
  params: courseIdParamSchema,
  query: z.object({}).optional()
})
