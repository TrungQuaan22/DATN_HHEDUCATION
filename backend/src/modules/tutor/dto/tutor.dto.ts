import type { ChatRole } from '@prisma/client'
import z from 'zod'

import type {
  createTutorSessionBodySchema,
  sendTutorMessageBodySchema
} from '../validators/tutor.validator'

export type CreateTutorSessionDto = z.infer<typeof createTutorSessionBodySchema>

export type SendTutorMessageDto = z.infer<typeof sendTutorMessageBodySchema> & {
  sessionId: string
}

export type TutorCitationDto = {
  id: string
  chunkId: string
  rank: number
  score: number | null
  quote: string | null
  sourceTitle: string | null
}

export type TutorMessageDto = {
  id: string
  role: ChatRole
  content: string
  provider: string | null
  modelName: string | null
  latencyMs: number | null
  createdAt: Date
  citations: TutorCitationDto[]
}

export type TutorSessionDto = {
  id: string
  studentId: string
  courseId: string
  lessonId: string | null
  title: string | null
  lastMessageAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type TutorSessionDetailDto = TutorSessionDto & {
  messages: TutorMessageDto[]
}

export type SendTutorMessageResponse = {
  session: TutorSessionDto
  message: TutorMessageDto
}
