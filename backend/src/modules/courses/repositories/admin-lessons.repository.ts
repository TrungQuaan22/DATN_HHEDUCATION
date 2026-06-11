import { type LessonType, type Prisma, type VideoType } from '@prisma/client'

import { prisma } from '~/config/db'

import type { AdminLessonRepositoryPort } from '../ports/admin-lesson-repository.port'
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

const moveFollowingLessonsUp = (tx: Prisma.TransactionClient, data: {
  chapterId: string
  deletedOrderIndex: number
}) =>
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

export class PrismaAdminLessonRepository implements AdminLessonRepositoryPort {
  findLessonById(lessonId: string) {
    return prisma.lesson.findFirst({
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
                teacherId: true,
                status: true,
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
  }

  findAssessmentById(assessmentId: string) {
    return prisma.assessment.findUnique({
      where: {
        id: assessmentId
      },
      select: {
        id: true
      }
    })
  }

  listChapterLessonIds(chapterId: string) {
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
  }) {
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
        include: {
          videoMedia: {
            select: lessonVideoMediaSelect
          },
          assessmentPlacements: {
            where: { type: 'lesson' },
            select: { assessmentId: true }
          }
        }
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

      return lesson
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
  }) {
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
      let finalVideoMediaId = data.videoMediaId !== undefined ? data.videoMediaId : current.videoMediaId
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
        include: {
          videoMedia: {
            select: lessonVideoMediaSelect
          },
          assessmentPlacements: {
            where: { type: 'lesson' },
            select: { assessmentId: true }
          }
        }
      })

      return lesson
    })
  }

  softDeleteLesson(data: { lessonId: string; courseId: string }) {
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
        }
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

      return lesson
    })
  }

  async reorderLessons(chapterId: string, lessonIds: string[]) {
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
