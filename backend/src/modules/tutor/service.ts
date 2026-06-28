import { ChatRole } from '@prisma/client'
import type { Response } from 'express'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { aiServiceConfig } from '~/config/ai-service'

import type {
  CreateTutorSessionDto,
  SendTutorMessageDto,
  SendTutorMessageResponse,
  TutorMessageDto,
  TutorSessionDetailDto,
  TutorSessionDto
} from './dto/tutor.dto'
import {
  TutorRepository,
  tutorRepository,
  type TutorMessageRecord,
  type TutorSessionDetailRecord,
  type TutorSessionRecord
} from './repository'

type AiCitation = {
  chunk_id: string
  rank: number
  score: number | null
  quote: string | null
  source_title?: string | null
}

type AiChatResponse = {
  answer: string
  citations: AiCitation[]
  provider?: string | null
  model_name?: string | null
  latency_ms?: number | null
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isAiCitation = (value: unknown): value is AiCitation =>
  isRecord(value) &&
  typeof value.chunk_id === 'string' &&
  typeof value.rank === 'number' &&
  (typeof value.score === 'number' || value.score === null) &&
  (typeof value.quote === 'string' || value.quote === null)

const mapSession = (session: TutorSessionRecord): TutorSessionDto => ({
  id: session.id,
  studentId: session.studentId,
  courseId: session.courseId,
  lessonId: session.lessonId,
  title: session.title,
  lastMessageAt: session.lastMessageAt,
  createdAt: session.createdAt,
  updatedAt: session.updatedAt
})

const mapMessage = (message: TutorMessageRecord): TutorMessageDto => ({
  id: message.id,
  role: message.role,
  content: message.content,
  provider: message.provider,
  modelName: message.modelName,
  latencyMs: message.latencyMs,
  createdAt: message.createdAt,
  citations: message.citations.map((citation) => ({
    id: citation.id,
    chunkId: citation.chunkId,
    rank: citation.rank,
    score: citation.score?.toNumber() ?? null,
    quote: citation.quote,
    sourceTitle: citation.sourceTitle
  }))
})

const mapSessionDetail = (session: TutorSessionDetailRecord): TutorSessionDetailDto => ({
  ...mapSession(session),
  messages: session.messages.map(mapMessage)
})

export class TutorService {
  constructor(private readonly repository: TutorRepository) {}

  private async ensureEnrollment(studentId: string, courseId: string): Promise<void> {
    const enrollment = await this.repository.findEnrolledCourse({ studentId, courseId })

    if (!enrollment || enrollment.course.deletedAt || enrollment.course.status !== 'published') {
      throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
    }
  }

  private async ensureLessonInCourse(courseId: string, lessonId?: string | null): Promise<void> {
    if (!lessonId) return

    const lesson = await this.repository.findLessonInCourse({ courseId, lessonId })

    if (!lesson) {
      throw new AppError(404, ERROR_CODE.LESSON_NOT_FOUND, ERROR_MESSAGE.LESSON_NOT_FOUND)
    }
  }

  async listSessions(
    studentId: string,
    courseId?: string,
    lessonId?: string | null
  ): Promise<TutorSessionDto[]> {
    if (courseId) {
      await this.ensureEnrollment(studentId, courseId)
    }
    if (courseId && lessonId) {
      await this.ensureLessonInCourse(courseId, lessonId)
    }

    const sessions = await this.repository.listSessions({ studentId, courseId, lessonId })

    return sessions.map(mapSession)
  }

  async createSession(studentId: string, input: CreateTutorSessionDto): Promise<TutorSessionDto> {
    await this.ensureEnrollment(studentId, input.courseId)
    await this.ensureLessonInCourse(input.courseId, input.lessonId)

    const session = await this.repository.createSession({
      studentId,
      courseId: input.courseId,
      lessonId: input.lessonId ?? null,
      title: 'AI Tutor'
    })

    return mapSession(session)
  }

  async getSessionDetail(studentId: string, sessionId: string): Promise<TutorSessionDetailDto> {
    const session = await this.repository.findSessionDetail({ studentId, sessionId })

    if (!session) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Tutor chat session not found')
    }

    return mapSessionDetail(session)
  }

  async sendMessage(
    studentId: string,
    input: SendTutorMessageDto
  ): Promise<SendTutorMessageResponse> {
    const session = await this.repository.findSessionDetail({
      studentId,
      sessionId: input.sessionId
    })

    if (!session) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Tutor chat session not found')
    }

    await this.ensureEnrollment(studentId, session.courseId)
    const targetLessonId = input.lessonId ?? session.lessonId
    await this.ensureLessonInCourse(session.courseId, targetLessonId)

    await this.repository.createMessage({
      sessionId: session.id,
      role: ChatRole.user,
      content: input.message
    })
    await this.repository.updateSessionLastMessageAt(session.id)

    const startedAt = Date.now()
    const aiResponse = await this.callAiService({
      courseId: session.courseId,
      lessonId: targetLessonId ?? null,
      question: input.message,
      chatHistory: session.messages.slice(-6).map((message) => ({
        role: message.role,
        content: message.content
      }))
    })
    const latencyMs = Date.now() - startedAt

    const chunkIds = aiResponse.citations.map((citation) => citation.chunk_id)
    const existingChunks = new Set(
      (await this.repository.findChunksByIds(session.courseId, chunkIds)).map((chunk) => chunk.id)
    )

    const saved = await this.repository.saveAssistantResponse({
      sessionId: session.id,
      content: aiResponse.answer,
      provider: aiResponse.provider ?? null,
      modelName: aiResponse.model_name ?? null,
      latencyMs: aiResponse.latency_ms ?? latencyMs,
      citations: aiResponse.citations
        .filter((citation) => existingChunks.has(citation.chunk_id))
        .map((citation) => ({
          chunkId: citation.chunk_id,
          rank: citation.rank,
          score: citation.score,
          quote: citation.quote,
          sourceTitle: citation.source_title ?? null
        }))
    })

    return {
      session: mapSession(saved.session),
      message: mapMessage(saved.message)
    }
  }

  private async callAiService(data: {
    courseId: string
    lessonId: string | null
    question: string
    chatHistory: Array<{ role: string; content: string }>
  }): Promise<AiChatResponse> {
    const response = await fetch(`${aiServiceConfig.baseUrl}/api/v1/tutor/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(aiServiceConfig.internalToken
          ? { 'X-AI-Service-Token': aiServiceConfig.internalToken }
          : {})
      },
      body: JSON.stringify({
        course_id: data.courseId,
        lesson_id: data.lessonId,
        question: data.question,
        chat_history: data.chatHistory
      })
    })

    if (!response.ok) {
      const message = await response.text()
      throw new AppError(502, ERROR_CODE.BAD_REQUEST, message.slice(0, 2000))
    }

    return (await response.json()) as AiChatResponse
  }

  async sendMessageStream(
    studentId: string,
    input: SendTutorMessageDto,
    clientRes: Response
  ): Promise<void> {
    const session = await this.repository.findSessionDetail({
      studentId,
      sessionId: input.sessionId
    })

    if (!session) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Tutor chat session not found')
    }

    await this.ensureEnrollment(studentId, session.courseId)
    const targetLessonId = input.lessonId ?? session.lessonId
    await this.ensureLessonInCourse(session.courseId, targetLessonId)

    // Save student message in DB
    await this.repository.createMessage({
      sessionId: session.id,
      role: ChatRole.user,
      content: input.message
    })
    await this.repository.updateSessionLastMessageAt(session.id)

    // Setup aborted flag
    let isAborted = false
    clientRes.on('close', () => {
      isAborted = true
    })

    try {
      const response = await fetch(`${aiServiceConfig.baseUrl}/api/v1/tutor/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(aiServiceConfig.internalToken
            ? { 'X-AI-Service-Token': aiServiceConfig.internalToken }
            : {})
        },
        body: JSON.stringify({
          course_id: session.courseId,
          lesson_id: targetLessonId ?? null,
          question: input.message,
          chat_history: session.messages.slice(-6).map((message) => ({
            role: message.role,
            content: message.content
          }))
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        clientRes.write(`event: error\ndata: ${JSON.stringify({ message: errorText })}\n\n`)
        clientRes.end()
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        clientRes.write(`event: error\ndata: ${JSON.stringify({ message: 'No body reader' })}\n\n`)
        clientRes.end()
        return
      }

      const decoder = new TextDecoder()
      let citations: AiCitation[] = []
      let accumulatedContent = ''
      let provider: string | null = null
      let modelName: string | null = null
      let buffer = ''
      const collectEvent = (event: string, data: unknown) => {
        if (event === 'citations' && Array.isArray(data)) {
          citations = data.filter(isAiCitation)
        }
        if (event === 'content' && isRecord(data) && typeof data.text === 'string') {
          accumulatedContent += data.text
        }
        if (event === 'done' && isRecord(data)) {
          provider = typeof data.provider === 'string' ? data.provider : null
          modelName = typeof data.model_name === 'string' ? data.model_name : null
        }
      }

      while (!isAborted) {
        const { done, value } = await reader.read()
        if (done) {
          if (buffer) {
            this.processSseBuffer(buffer, clientRes, collectEvent)
          }
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const boundary = buffer.lastIndexOf('\n\n')
        if (boundary !== -1) {
          const completeEvents = buffer.substring(0, boundary)
          buffer = buffer.substring(boundary + 2)
          this.processSseBuffer(completeEvents, clientRes, collectEvent)
        }
      }

      if (isAborted) {
        reader.cancel()
        return
      }

      // Save assistant response to DB
      const existingChunks = new Set(
        (
          await this.repository.findChunksByIds(
            session.courseId,
            citations.map((c) => c.chunk_id)
          )
        ).map((chunk) => chunk.id)
      )

      await this.repository.saveAssistantResponse({
        sessionId: session.id,
        content: accumulatedContent,
        provider: provider ?? null,
        modelName: modelName ?? null,
        latencyMs: 0,
        citations: citations
          .filter((citation) => existingChunks.has(citation.chunk_id))
          .map((citation) => ({
            chunkId: citation.chunk_id,
            rank: citation.rank,
            score: citation.score,
            quote: citation.quote,
            sourceTitle: citation.source_title ?? null
          }))
      })

      clientRes.end()
    } catch (error: unknown) {
      console.error('Error in sendMessageStream:', error)
      if (!isAborted) {
        const message = error instanceof Error ? error.message : 'Unexpected streaming error'
        clientRes.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`)
        clientRes.end()
      }
    }
  }

  private processSseBuffer(
    bufferText: string,
    clientRes: Response,
    onParsed: (event: string, data: unknown) => void
  ) {
    const blocks = bufferText.split('\n\n')
    for (const block of blocks) {
      if (!block.trim()) continue

      const lines = block.split('\n')
      let event = ''
      let data = ''

      for (const line of lines) {
        if (line.startsWith('event:')) {
          event = line.substring(6).trim()
        } else if (line.startsWith('data:')) {
          data = line.substring(5).trim()
        }
      }

      if (event && data) {
        // Forward event to Express client
        clientRes.write(`event: ${event}\ndata: ${data}\n\n`)

        try {
          const parsedData: unknown = JSON.parse(data)
          onParsed(event, parsedData)
        } catch {
          // not JSON, just pass raw
          onParsed(event, data)
        }
      }
    }
  }
}

export const tutorService = new TutorService(tutorRepository)
