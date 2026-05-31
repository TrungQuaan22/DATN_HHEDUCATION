import type { Prisma } from '@prisma/client'

export const adminTeacherSelect = {
  id: true,
  email: true,
  fullName: true,
  avatarMediaId: true,
  avatarObjectKey: true
} satisfies Prisma.UserSelect

export const publicTeacherSelect = {
  id: true,
  fullName: true,
  avatarObjectKey: true
} satisfies Prisma.UserSelect

export const lessonVideoMediaSelect = {
  id: true,
  objectKey: true,
  originalName: true,
  status: true,
  durationSec: true
} satisfies Prisma.MediaSelect

export const lessonAssessmentSelect = {
  assessmentId: true
} satisfies Prisma.LessonAssessmentSelect
