import { BlogPostStatus } from '@prisma/client'
import z from 'zod'

import { richContentSchema } from './rich-content.validator'

const blogPostIdParamSchema = z
  .object({
    blogPostId: z.string().uuid()
  })
  .strict()

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe kebab-case')

const queryBooleanSchema = z.preprocess((value) => {
  if (value === 'true') return true
  if (value === 'false') return false
  return value
}, z.boolean())

const tagsSchema = z.array(z.string().trim().min(1).max(50)).max(10).default([])

export const createBlogPostBodySchema = z
  .object({
    title: z.string().trim().min(2).max(255),
    excerpt: z.string().trim().max(500).optional().nullable(),
    categoryId: z.string().uuid().optional().nullable(),
    tags: tagsSchema.optional(),
    content: richContentSchema.optional(),
    thumbnailMediaId: z.string().uuid().optional().nullable(),
    isFeatured: z.boolean().optional()
  })
  .strict()

export const updateBlogPostBodySchema = z
  .object({
    title: z.string().trim().min(2).max(255).optional(),
    excerpt: z.string().trim().max(500).optional().nullable(),
    categoryId: z.string().uuid().optional().nullable(),
    tags: tagsSchema.optional(),
    content: richContentSchema.optional(),
    thumbnailMediaId: z.string().uuid().optional().nullable(),
    isFeatured: z.boolean().optional()
  })
  .strict()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required'
  })

export const listAdminBlogPostsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.nativeEnum(BlogPostStatus).optional(),
    authorId: z.string().uuid().optional(),
    categorySlug: slugSchema.optional(),
    tag: z.string().trim().min(1).max(50).optional(),
    isFeatured: queryBooleanSchema.optional(),
    search: z.string().trim().min(1).max(100).optional()
  })
  .strict()

export const createBlogPostSchema = z.object({
  body: createBlogPostBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional()
})

export const updateBlogPostSchema = z.object({
  body: updateBlogPostBodySchema,
  params: blogPostIdParamSchema,
  query: z.object({}).optional()
})

export const listAdminBlogPostsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: listAdminBlogPostsQuerySchema
})

export const listAdminBlogTagsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z
    .object({
      limit: z.coerce.number().int().min(1).max(100).default(50)
    })
    .strict()
})

export const listAdminBlogCategoriesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z
    .object({
      limit: z.coerce.number().int().min(1).max(100).default(50)
    })
    .strict()
})

export const createBlogCategoryBodySchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    slug: slugSchema.optional()
  })
  .strict()

export const createBlogCategorySchema = z.object({
  body: createBlogCategoryBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional()
})

export const getAdminBlogPostSchema = z.object({
  body: z.object({}).optional(),
  params: blogPostIdParamSchema,
  query: z.object({}).optional()
})

export const changeBlogPostStatusSchema = z.object({
  body: z.object({}).optional(),
  params: blogPostIdParamSchema,
  query: z.object({}).optional()
})

export const deleteBlogPostSchema = z.object({
  body: z.object({}).optional(),
  params: blogPostIdParamSchema,
  query: z.object({}).optional()
})
