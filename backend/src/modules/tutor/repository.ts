import { ChatRole, Prisma } from '@prisma/client'

import { prisma } from '~/config/db'

const SESSION_SELECT = {
  id: true,
  studentId: true,
  courseId: true,
  lessonId: true,
  title: true,
  lastMessageAt: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.TutorChatSessionSelect

const MESSAGE_INCLUDE = {
  citations: {
    orderBy: {
      rank: 'asc'
    },
    select: {
      id: true,
      chunkId: true,
      rank: true,
      score: true,
      quote: true,
      sourceTitle: true
    }
  }
} satisfies Prisma.TutorChatMessageInclude

export type TutorSessionRecord = Prisma.TutorChatSessionGetPayload<{
  select: typeof SESSION_SELECT
}>

export type TutorMessageRecord = Prisma.TutorChatMessageGetPayload<{
  include: typeof MESSAGE_INCLUDE
}>

export type TutorSessionDetailRecord = TutorSessionRecord & {
  messages: TutorMessageRecord[]
}

export class TutorRepository {
  findEnrolledCourse(data: { studentId: string; courseId: string }) {
    return prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: data.studentId,
          courseId: data.courseId
        }
      },
      select: {
        course: {
          select: {
            id: true,
            title: true,
            status: true,
            deletedAt: true
          }
        }
      }
    })
  }

  findLessonInCourse(data: { courseId: string; lessonId: string }) {
    return prisma.lesson.findFirst({
      where: {
        id: data.lessonId,
        deletedAt: null,
        chapter: {
          courseId: data.courseId,
          deletedAt: null
        }
      },
      select: {
        id: true,
        title: true,
        type: true
      }
    })
  }

  listSessions(data: { studentId: string; courseId?: string; lessonId?: string | null }) {
    return prisma.tutorChatSession.findMany({
      where: {
        studentId: data.studentId,
        courseId: data.courseId,
        lessonId: data.lessonId !== undefined ? data.lessonId : undefined,
        deletedAt: null
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 20,
      select: SESSION_SELECT
    })
  }

  findSessionDetail(data: { studentId: string; sessionId: string }) {
    return prisma.tutorChatSession.findFirst({
      where: {
        id: data.sessionId,
        studentId: data.studentId,
        deletedAt: null
      },
      select: {
        ...SESSION_SELECT,
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          include: MESSAGE_INCLUDE
        }
      }
    })
  }

  createSession(data: {
    studentId: string
    courseId: string
    lessonId?: string | null
    title?: string | null
  }) {
    return prisma.tutorChatSession.create({
      data: {
        studentId: data.studentId,
        courseId: data.courseId,
        lessonId: data.lessonId ?? null,
        title: data.title ?? null
      },
      select: SESSION_SELECT
    })
  }

  createMessage(data: {
    sessionId: string
    role: ChatRole
    content: string
    provider?: string | null
    modelName?: string | null
    latencyMs?: number | null
  }) {
    return prisma.tutorChatMessage.create({
      data: {
        sessionId: data.sessionId,
        role: data.role,
        content: data.content,
        provider: data.provider ?? null,
        modelName: data.modelName ?? null,
        latencyMs: data.latencyMs ?? null
      },
      include: MESSAGE_INCLUDE
    })
  }

  async saveAssistantResponse(data: {
    sessionId: string
    content: string
    provider?: string | null
    modelName?: string | null
    latencyMs?: number | null
    citations: Array<{
      chunkId: string
      rank: number
      score: number | null
      quote: string | null
      sourceTitle: string | null
    }>
  }) {
    return prisma.$transaction(async (tx) => {
      const message = await tx.tutorChatMessage.create({
        data: {
          sessionId: data.sessionId,
          role: ChatRole.assistant,
          content: data.content,
          provider: data.provider ?? null,
          modelName: data.modelName ?? null,
          latencyMs: data.latencyMs ?? null,
          citations: {
            create: data.citations.map((citation) => ({
              chunkId: citation.chunkId,
              rank: citation.rank,
              score: citation.score === null ? null : new Prisma.Decimal(citation.score),
              quote: citation.quote,
              sourceTitle: citation.sourceTitle
            }))
          }
        },
        include: MESSAGE_INCLUDE
      })

      const session = await tx.tutorChatSession.update({
        where: {
          id: data.sessionId
        },
        data: {
          lastMessageAt: new Date()
        },
        select: SESSION_SELECT
      })

      return {
        session,
        message
      }
    })
  }

  updateSessionLastMessageAt(sessionId: string) {
    return prisma.tutorChatSession.update({
      where: {
        id: sessionId
      },
      data: {
        lastMessageAt: new Date()
      },
      select: SESSION_SELECT
    })
  }

  findChunksByIds(courseId: string, chunkIds: string[]) {
    return prisma.knowledgeChunk.findMany({
      where: {
        id: {
          in: chunkIds
        },
        courseId
      },
      select: {
        id: true
      }
    })
  }
}

export const tutorRepository = new TutorRepository()
