import type { Chapter, Prisma } from '@prisma/client'

import { prisma } from '~/config/db'

import type {
  AdminChapterRecord,
  AdminChapterRepositoryPort,
  AdminChapterWithCourseRecord
} from '../ports/admin-chapter-repository.port'

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

const moveFollowingChaptersUp = (
  tx: Prisma.TransactionClient,
  data: {
    courseId: string
    deletedOrderIndex: number
  }
) =>
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

function mapToChapterRecord(chapter: Chapter): AdminChapterRecord {
  return {
    id: chapter.id,
    courseId: chapter.courseId,
    title: chapter.title,
    orderIndex: chapter.orderIndex,
    createdAt: chapter.createdAt,
    updatedAt: chapter.updatedAt
  }
}

export class PrismaAdminChapterRepository implements AdminChapterRepositoryPort {
  async findChapterById(chapterId: string): Promise<AdminChapterWithCourseRecord | null> {
    const chapter = await prisma.chapter.findFirst({
      where: {
        id: chapterId,
        deletedAt: null
      },
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
    })

    if (!chapter) return null

    return {
      ...mapToChapterRecord(chapter),
      course: {
        id: chapter.course.id,
        title: chapter.course.title,
        slug: chapter.course.slug,
        teacherId: chapter.course.teacherId,
        status: chapter.course.status,
        price: Number(chapter.course.price),
        salePrice: chapter.course.salePrice === null ? null : Number(chapter.course.salePrice),
        deletedAt: chapter.course.deletedAt
      }
    }
  }

  async listCourseChapterIds(courseId: string) {
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

  async createChapter(data: { courseId: string; title: string }): Promise<AdminChapterRecord> {
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

    const chapter = await prisma.chapter.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        orderIndex: nextOrderIndex
      }
    })

    return mapToChapterRecord(chapter)
  }

  async updateChapter(data: { chapterId: string; title: string }): Promise<AdminChapterRecord> {
    const chapter = await prisma.chapter.update({
      where: {
        id: data.chapterId
      },
      data: {
        title: data.title
      }
    })

    return mapToChapterRecord(chapter)
  }

  async countActiveLessonsByChapter(chapterId: string) {
    return prisma.lesson.count({
      where: {
        chapterId,
        deletedAt: null
      }
    })
  }

  async softDeleteChapter(chapterId: string): Promise<AdminChapterRecord> {
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

      return mapToChapterRecord(deletedChapter)
    })
  }

  async reorderChapters(
    courseId: string,
    chapterIds: string[]
  ): Promise<Array<{ id: string; orderIndex: number }>> {
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
