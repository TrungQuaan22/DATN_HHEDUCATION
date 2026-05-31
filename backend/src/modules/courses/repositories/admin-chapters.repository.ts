import type { Prisma } from '@prisma/client'

import { prisma } from '~/config/db'

import type { AdminChapterRepositoryPort } from '../ports/admin-chapter-repository.port'

const getNextDeletedChapterOrderIndex = async (tx: Prisma.TransactionClient) => {
  const deletedChapterOrder = await tx.chapter.aggregate({
    where: {
      orderIndex: {
        lt: 0
      }
    },
    _min: {
      orderIndex: true
    }
  })

  return (deletedChapterOrder._min.orderIndex ?? 0) - 1
}

const moveFollowingChaptersUp = (tx: Prisma.TransactionClient, data: {
  courseId: string
  deletedOrderIndex: number
}) =>
  tx.chapter.updateMany({
    where: {
      courseId: data.courseId,
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

const buildTemporaryChapterOrderUpdates = (chapterIds: string[]) => {
  return chapterIds.map((chapterId, index) => {
    const temporaryOrderIndex = -(index + 1)

    return prisma.chapter.update({
      where: { id: chapterId },
      data: { orderIndex: temporaryOrderIndex }
    })
  })
}

const buildFinalChapterOrderUpdates = (chapterIds: string[]) => {
  return chapterIds.map((chapterId, index) => {
    const finalOrderIndex = index + 1

    return prisma.chapter.update({
      where: { id: chapterId },
      data: { orderIndex: finalOrderIndex }
    })
  })
}

export class PrismaAdminChapterRepository implements AdminChapterRepositoryPort {
  findChapterById(chapterId: string) {
    return prisma.chapter.findFirst({
      where: {
        id: chapterId,
        deletedAt: null
      },
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
    })
  }

  listCourseChapterIds(courseId: string) {
    return prisma.chapter.findMany({
      where: {
        courseId,
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

  async createChapter(data: { courseId: string; title: string }) {
    const aggregate = await prisma.chapter.aggregate({
      where: {
        courseId: data.courseId,
        deletedAt: null
      },
      _max: {
        orderIndex: true
      }
    })

    const nextOrderIndex = (aggregate._max.orderIndex ?? 0) + 1

    return prisma.chapter.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        orderIndex: nextOrderIndex
      }
    })
  }

  updateChapter(data: { chapterId: string; title: string }) {
    return prisma.chapter.update({
      where: {
        id: data.chapterId
      },
      data: {
        title: data.title
      }
    })
  }

  countActiveLessonsByChapter(chapterId: string) {
    return prisma.lesson.count({
      where: {
        chapterId,
        deletedAt: null
      }
    })
  }

  softDeleteChapter(chapterId: string) {
    return prisma.$transaction(async (tx) => {
      const chapter = await tx.chapter.findUniqueOrThrow({
        where: {
          id: chapterId
        },
        select: {
          courseId: true,
          orderIndex: true
        }
      })
      const deletedOrderIndex = await getNextDeletedChapterOrderIndex(tx)

      const deletedChapter = await tx.chapter.update({
        where: {
          id: chapterId
        },
        data: {
          deletedAt: new Date(),
          orderIndex: deletedOrderIndex
        }
      })

      await moveFollowingChaptersUp(tx, {
        courseId: chapter.courseId,
        deletedOrderIndex: chapter.orderIndex
      })

      return deletedChapter
    })
  }

  async reorderChapters(courseId: string, chapterIds: string[]) {
    const operations = [
      ...buildTemporaryChapterOrderUpdates(chapterIds),
      ...buildFinalChapterOrderUpdates(chapterIds)
    ]

    await prisma.$transaction(operations)

    return prisma.chapter.findMany({
      where: { courseId, deletedAt: null },
      orderBy: { orderIndex: 'asc' },
      select: { id: true, orderIndex: true }
    })
  }
}

export const adminChapterRepository = new PrismaAdminChapterRepository()
