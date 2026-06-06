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

export const getLearningLessonSchema = z.object({
  body: z.object({}).optional(),
  params: z
    .object({
      lessonId: z.string().uuid()
    })
    .strict(),
  query: z.object({}).optional()
})

export const getLearningLessonHlsSchema = z.object({
  body: z.object({}).optional(),
  params: z
    .object({
      lessonId: z.string().uuid(),
      fileName: z.string().regex(/^(index\.m3u8|segment_\d{3,}\.ts)$/)
    })
    .strict(),
  query: z.object({}).optional()
})

export const updateLessonProgressSchema = z.object({
  body: z
    .object({
      watchedSeconds: z.number().int().min(0),
      lastPositionSec: z.number().int().min(0)
    })
    .strict(),
  params: z
    .object({
      lessonId: z.string().uuid()
    })
    .strict(),
  query: z.object({}).optional()
})

export const listMyCoursesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).strict(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  })
})
