import { LessonType, VideoType } from '@prisma/client'
import z from 'zod'

const chapterIdParamSchema = z
  .object({
    chapterId: z.string().uuid()
  })
  .strict()

const lessonIdParamSchema = z
  .object({
    lessonId: z.string().uuid()
  })
  .strict()

const titleSchema = z.string().trim().min(2).max(255)
const descriptionSchema = z.string().trim().min(1).max(5000)
const durationSchema = z.number().int().min(0)
const allowPreviewSchema = z.boolean().optional()


//oneOf the following shapes based on the lesson type and video type
export const createLessonBodySchema = z.union([
  //type = document
  z
    .object({
      title: titleSchema,
      type: z.literal(LessonType.document),
      description: descriptionSchema,
      allowPreview: allowPreviewSchema
    })
    .strict(),
    //type = quiz 
  z
    .object({
      title: titleSchema,
      type: z.literal(LessonType.quiz),
      description: z.string().trim().max(5000).optional().nullable(),
      assessmentId: z.string().uuid(),
      allowPreview: allowPreviewSchema
    })
    .strict(),
    //type = video & videoType = system
  z
    .object({
      title: titleSchema,
      type: z.literal(LessonType.video),
      videoType: z.literal(VideoType.system),
      description: z.string().trim().max(5000).optional().nullable(),
      videoMediaId: z.string().uuid(),
      durationSec: durationSchema.optional().nullable(),
      allowPreview: allowPreviewSchema
    })
    .strict(),
    //type = video & videoType = youtube
  z
    .object({
      title: titleSchema,
      type: z.literal(LessonType.video),
      videoType: z.literal(VideoType.youtube),
      description: z.string().trim().max(5000).optional().nullable(),
      youtubeUrl: z.string().trim().url(),
      durationSec: durationSchema.optional().nullable(),
      allowPreview: allowPreviewSchema
    })
    .strict()
])

export const createLessonSchema = z.object({
  body: createLessonBodySchema,
  params: chapterIdParamSchema,
  query: z.object({}).optional()
})

export const updateLessonBodySchema = z
  .object({
    title: titleSchema.optional(),
    description: z.string().trim().max(5000).optional().nullable(),
    allowPreview: z.boolean().optional(),
    type: z.nativeEnum(LessonType).optional(),
    videoType: z.nativeEnum(VideoType).optional().nullable(),
    videoMediaId: z.string().uuid().optional().nullable(),
    youtubeUrl: z.string().trim().url().optional().nullable(),
    durationSec: durationSchema.optional().nullable(),
    assessmentId: z.string().uuid().optional().nullable()
  })
  .strict()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required'
  })

export const updateLessonSchema = z.object({
  body: updateLessonBodySchema,
  params: lessonIdParamSchema,
  query: z.object({}).optional()
})

export const deleteLessonSchema = z.object({
  body: z.object({}).optional(),
  params: lessonIdParamSchema,
  query: z.object({}).optional()
})

export const reorderLessonsBodySchema = z
  .object({
    lessonIds: z.array(z.string().uuid()).min(1)
  })
  .strict()

export const reorderLessonsSchema = z.object({
  body: reorderLessonsBodySchema,
  params: chapterIdParamSchema,
  query: z.object({}).optional()
})
