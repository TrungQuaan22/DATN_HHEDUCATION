import { type LessonType, type Prisma, type VideoType } from '@prisma/client'

import { prisma } from '~/config/db'

import type {
  AdminLessonRecord,
  AdminLessonRepositoryPort,
  AdminLessonWithChapterRecord
} from '../ports/admin-lesson-repository.port'
import { lessonVideoMediaSelect } from './shared'

const getNextDeletedLessonOrderIndex = async (tx: Prisma.TransactionClient) => {
  const deletedLessonOrder = await tx.lesson.aggregate({
    where: {
      orderIndex: {
        lt: 0
      }
    },
    _min: {
      orderIndex: true
    }
  })

  return (deletedLessonOrder._min.orderIndex ?? 0) - 1
}

const moveFollowingLessonsUp = (
  tx: Prisma.TransactionClient,
  data: {
    chapterId: string
    deletedOrderIndex: number
  }
) =>
  tx.lesson.updateMany({
    where: {
      chapterId: data.chapterId,
      deletedAt: null,
      orderIndex: {
        gt: data.deletedOrderIndex
      }
    },
    data: {
      orderIndex: {
        decrement: 1
      }
    }
  })

const buildTemporaryLessonOrderUpdates = (lessonIds: string[]) => {
  return lessonIds.map((lessonId, index) => {
    const temporaryOrderIndex = -(index + 1)

    return prisma.lesson.update({
      where: { id: lessonId },
      data: { orderIndex: temporaryOrderIndex }
    })
  })
}

const buildFinalLessonOrderUpdates = (lessonIds: string[]) => {
  return lessonIds.map((lessonId, index) => {
    const finalOrderIndex = index + 1

    return prisma.lesson.update({
      where: { id: lessonId },
      data: { orderIndex: finalOrderIndex }
    })
  })
}

const ADMIN_LESSON_INCLUDE = {
  videoMedia: {
    select: lessonVideoMediaSelect
  },
  assessmentPlacements: {
    where: { type: 'lesson' },
    select: { assessmentId: true }
  }
} satisfies Prisma.LessonInclude

type PrismaAdminLesson = Prisma.LessonGetPayload<{
  include: typeof ADMIN_LESSON_INCLUDE
}>

function mapToLessonRecord(lesson: PrismaAdminLesson): AdminLessonRecord {
  return {
    id: lesson.id,
    chapterId: lesson.chapterId,
    title: lesson.title,
    type: lesson.type,
    description: lesson.description,
    videoType: lesson.videoType,
    videoMediaId: lesson.videoMediaId,
    videoMedia: lesson.videoMedia
      ? {
          id: lesson.videoMedia.id,
          objectKey: lesson.videoMedia.objectKey,
          originalName: lesson.videoMedia.originalName,
          status: lesson.videoMedia.status,
          durationSec: lesson.videoMedia.durationSec
        }
      : null,
    youtubeUrl: lesson.youtubeUrl,
    durationSec: lesson.durationSec,
    allowPreview: lesson.allowPreview,
    assessmentId: lesson.assessmentPlacements?.[0]?.assessmentId ?? null,
    orderIndex: lesson.orderIndex,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt
  }
}

export class PrismaAdminLessonRepository implements AdminLessonRepositoryPort {
  async findLessonById(lessonId: string): Promise<AdminLessonWithChapterRecord | null> {
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        deletedAt: null
      },
      include: {
        chapter: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                teacherId: true,
                status: true,
                price: true,
                salePrice: true,
                deletedAt: true
              }
            }
          }
        },
        videoMedia: {
          select: lessonVideoMediaSelect
        },
        assessmentPlacements: {
          where: { type: 'lesson' },
          select: { assessmentId: true }
        }
      }
    })

    if (!lesson) return null

    return {
      ...mapToLessonRecord(lesson),
      chapter: {
        id: lesson.chapter.id,
        courseId: lesson.chapter.courseId,
        title: lesson.chapter.title,
        orderIndex: lesson.chapter.orderIndex,
        createdAt: lesson.chapter.createdAt,
        updatedAt: lesson.chapter.updatedAt,
        course: {
          id: lesson.chapter.course.id,
          title: lesson.chapter.course.title,
          slug: lesson.chapter.course.slug,
          teacherId: lesson.chapter.course.teacherId,
          status: lesson.chapter.course.status,
          price: Number(lesson.chapter.course.price),
          salePrice:
            lesson.chapter.course.salePrice === null
              ? null
              : Number(lesson.chapter.course.salePrice),
          deletedAt: lesson.chapter.course.deletedAt
        }
      }
    }
  }

  async findAssessmentById(assessmentId: string) {
    return prisma.assessment.findUnique({
      where: {
        id: assessmentId
      },
      select: {
        id: true
      }
    })
  }

  async listChapterLessonIds(chapterId: string) {
    return prisma.lesson.findMany({
      where: {
        chapterId,
        deletedAt: null
      },
      orderBy: {
        orderIndex: 'asc'
      },
      select: {
        id: true
      }
    })
  }

  async createLesson(data: {
    courseId: string
    chapterId: string
    title: string
    type: LessonType
    description?: string | null
    videoType?: VideoType | null
    videoMediaId?: string | null
    youtubeUrl?: string | null
    durationSec?: number | null
    allowPreview?: boolean
    assessmentId?: string | null
  }): Promise<AdminLessonRecord> {
    return prisma.$transaction(async (tx) => {
      const aggregate = await tx.lesson.aggregate({
        where: {
          chapterId: data.chapterId,
          deletedAt: null
        },
        _max: {
          orderIndex: true
        }
      })

      const nextOrderIndex = (aggregate._max.orderIndex ?? 0) + 1

      const lesson = await tx.lesson.create({
        data: {
          chapterId: data.chapterId,
          title: data.title,
          type: data.type,
          description: data.description,
          videoType: data.videoType,
          videoMediaId: data.videoMediaId,
          youtubeUrl: data.youtubeUrl,
          durationSec: data.durationSec,
          allowPreview: data.allowPreview,
          orderIndex: nextOrderIndex,
          assessmentPlacements: data.assessmentId
            ? {
                create: {
                  assessmentId: data.assessmentId,
                  type: 'lesson'
                }
              }
            : undefined
        },
        include: ADMIN_LESSON_INCLUDE
      })

      await tx.course.update({
        where: {
          id: data.courseId
        },
        data: {
          totalLessons: {
            increment: 1
          }
        }
      })

      return mapToLessonRecord(lesson)
    })
  }

  async updateLesson(data: {
    lessonId: string
    title?: string
    description?: string | null
    allowPreview?: boolean
    type?: LessonType
    videoType?: VideoType | null
    videoMediaId?: string | null
    youtubeUrl?: string | null
    durationSec?: number | null
    assessmentId?: string | null
  }): Promise<AdminLessonRecord> {
    return prisma.$transaction(async (tx) => {
      const current = await tx.lesson.findUniqueOrThrow({
        where: { id: data.lessonId },
        include: {
          assessmentPlacements: {
            where: { type: 'lesson' }
          }
        }
      })

      const targetType = data.type ?? current.type
      const currentAssessmentId = current.assessmentPlacements[0]?.assessmentId ?? null

      let newAssessmentId: string | null = currentAssessmentId
      if (data.assessmentId !== undefined) {
        newAssessmentId = data.assessmentId
      }

      if (targetType !== 'quiz') {
        newAssessmentId = null
      }

      // If assessment link changed, sync AssessmentPlacement
      if (newAssessmentId !== currentAssessmentId) {
        await tx.assessmentPlacement.deleteMany({
          where: { lessonId: data.lessonId, type: 'lesson' }
        })

        if (newAssessmentId) {
          await tx.assessmentPlacement.create({
            data: {
              assessmentId: newAssessmentId,
              type: 'lesson',
              lessonId: data.lessonId
            }
          })
        }
      } else if (newAssessmentId && current.type !== 'quiz' && targetType === 'quiz') {
        const placementExists = current.assessmentPlacements.length > 0
        if (!placementExists) {
          await tx.assessmentPlacement.create({
            data: {
              assessmentId: newAssessmentId,
              type: 'lesson',
              lessonId: data.lessonId
            }
          })
        }
      }

      let finalVideoType = data.videoType !== undefined ? data.videoType : current.videoType
      let finalVideoMediaId =
        data.videoMediaId !== undefined ? data.videoMediaId : current.videoMediaId
      let finalYoutubeUrl = data.youtubeUrl !== undefined ? data.youtubeUrl : current.youtubeUrl
      let finalDurationSec = data.durationSec !== undefined ? data.durationSec : current.durationSec

      if (targetType !== 'video') {
        finalVideoType = null
        finalVideoMediaId = null
        finalYoutubeUrl = null
        finalDurationSec = null
      } else if (finalVideoType === 'system') {
        finalYoutubeUrl = null
      } else if (finalVideoType === 'youtube') {
        finalVideoMediaId = null
      }

      const lesson = await tx.lesson.update({
        where: { id: data.lessonId },
        data: {
          title: data.title,
          description: data.description,
          allowPreview: data.allowPreview,
          type: data.type,
          videoType: finalVideoType,
          videoMediaId: finalVideoMediaId,
          youtubeUrl: finalYoutubeUrl,
          durationSec: finalDurationSec
        },
        include: ADMIN_LESSON_INCLUDE
      })

      return mapToLessonRecord(lesson)
    })
  }

  async softDeleteLesson(data: { lessonId: string; courseId: string }): Promise<AdminLessonRecord> {
    return prisma.$transaction(async (tx) => {
      const currentLesson = await tx.lesson.findUniqueOrThrow({
        where: {
          id: data.lessonId
        },
        select: {
          chapterId: true,
          orderIndex: true
        }
      })
      const deletedOrderIndex = await getNextDeletedLessonOrderIndex(tx)

      const lesson = await tx.lesson.update({
        where: {
          id: data.lessonId
        },
        data: {
          deletedAt: new Date(),
          orderIndex: deletedOrderIndex
        },
        include: ADMIN_LESSON_INCLUDE
      })

      await tx.course.update({
        where: {
          id: data.courseId
        },
        data: {
          totalLessons: {
            decrement: 1
          }
        }
      })

      await moveFollowingLessonsUp(tx, {
        chapterId: currentLesson.chapterId,
        deletedOrderIndex: currentLesson.orderIndex
      })

      return mapToLessonRecord(lesson)
    })
  }

  async reorderLessons(
    chapterId: string,
    lessonIds: string[]
  ): Promise<Array<{ id: string; orderIndex: number }>> {
    const operations = [
      ...buildTemporaryLessonOrderUpdates(lessonIds),
      ...buildFinalLessonOrderUpdates(lessonIds)
    ]

    await prisma.$transaction(operations)

    return prisma.lesson.findMany({
      where: { chapterId, deletedAt: null },
      orderBy: { orderIndex: 'asc' },
      select: { id: true, orderIndex: true }
    })
  }
}

export const adminLessonRepository = new PrismaAdminLessonRepository()
