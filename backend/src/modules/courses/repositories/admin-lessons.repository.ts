import { type LessonType, type Prisma, type VideoType } from '@prisma/client'

import { prisma } from '~/config/db'

import type { AdminLessonRepositoryPort } from '../ports/admin-lesson-repository.port'
import { lessonAssessmentSelect, lessonVideoMediaSelect } from './shared'

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
        lessonAssessments: {
          select: lessonAssessmentSelect
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
          lessonAssessments: data.assessmentId
            ? {
                create: {
                  assessmentId: data.assessmentId
                }
              }
            : undefined
        },
        include: {
          videoMedia: {
            select: lessonVideoMediaSelect
          },
          lessonAssessments: {
            select: lessonAssessmentSelect
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
  }) {
    return prisma.lesson.update({
      where: {
        id: data.lessonId
      },
      data: {
        title: data.title,
        description: data.description,
        allowPreview: data.allowPreview
      },
      include: {
        videoMedia: {
          select: lessonVideoMediaSelect
        },
        lessonAssessments: {
          select: lessonAssessmentSelect
        }
      }
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
