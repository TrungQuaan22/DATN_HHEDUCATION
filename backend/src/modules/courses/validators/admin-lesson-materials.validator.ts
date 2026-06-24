import { LessonMaterialType } from '@prisma/client'
import z from 'zod'

const lessonIdParamSchema = z
  .object({
    lessonId: z.string().uuid()
  })
  .strict()

const materialIdParamSchema = z
  .object({
    materialId: z.string().uuid()
  })
  .strict()

const titleSchema = z.string().trim().min(2).max(255)
const contentTextSchema = z.string().trim().min(1).max(200_000)

export const createLessonMaterialBodySchema = z.union([
  z
    .object({
      title: titleSchema,
      type: z.literal(LessonMaterialType.text),
      contentText: contentTextSchema,
      isPublic: z.boolean().optional()
    })
    .strict(),
  z
    .object({
      title: titleSchema,
      type: z.literal(LessonMaterialType.markdown),
      contentText: contentTextSchema,
      isPublic: z.boolean().optional()
    })
    .strict(),
  z
    .object({
      title: titleSchema,
      type: z.enum([
        LessonMaterialType.pdf,
        LessonMaterialType.docx,
        LessonMaterialType.pptx
      ]),
      mediaId: z.string().uuid(),
      isPublic: z.boolean().optional()
    })
    .strict()
])

export const updateLessonMaterialBodySchema = z
  .object({
    title: titleSchema.optional(),
    contentText: contentTextSchema.optional(),
    mediaId: z.string().uuid().optional(),
    isPublic: z.boolean().optional()
  })
  .strict()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required'
  })

export const createLessonMaterialSchema = z.object({
  body: createLessonMaterialBodySchema,
  params: lessonIdParamSchema,
  query: z.object({}).optional()
})

export const listLessonMaterialsSchema = z.object({
  body: z.object({}).optional(),
  params: lessonIdParamSchema,
  query: z.object({}).optional()
})

export const updateLessonMaterialSchema = z.object({
  body: updateLessonMaterialBodySchema,
  params: materialIdParamSchema,
  query: z.object({}).optional()
})

export const deleteLessonMaterialSchema = z.object({
  body: z.object({}).optional(),
  params: materialIdParamSchema,
  query: z.object({}).optional()
})

export const ingestLessonMaterialSchema = z.object({
  body: z.object({}).optional(),
  params: materialIdParamSchema,
  query: z.object({}).optional()
})
