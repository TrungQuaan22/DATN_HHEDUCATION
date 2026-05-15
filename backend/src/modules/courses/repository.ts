import { CourseStatus, UserRole, UserStatus, type Prisma, type Subject } from '@prisma/client'

import { prisma } from '~/config/db'
import type { GradeValue } from '~/common/constant/taxonomy'

export const courseRepository = {
  findActiveCourseBySlug(slug: string) {
    return prisma.course.findFirst({
      where: {
        slug,
        deletedAt: null
      },
      select: {
        id: true
      }
    })
  },

  findActiveTeacherById(teacherId: string) {
    return prisma.user.findFirst({
      where: {
        id: teacherId,
        role: UserRole.teacher,
        status: UserStatus.active,
        deletedAt: null
      },
      select: {
        id: true
      }
    })
  },

  findCourseById(courseId: string) {
    return prisma.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null
      },
      include: {
        teacher: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        thumbnailMedia: {
          select: {
            id: true,
            objectKey: true
          }
        }
      }
    })
  },

  findCourseDetailById(courseId: string) {
    return prisma.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null
      },
      include: {
        teacher: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        thumbnailMedia: {
          select: {
            id: true,
            objectKey: true
          }
        },
        chapters: {
          orderBy: {
            orderIndex: 'asc'
          }
        }
      }
    })
  },

  findChapterById(chapterId: string) {
    return prisma.chapter.findFirst({
      where: {
        id: chapterId
      },
      include: {
        course: {
          select: {
            id: true,
            status: true,
            deletedAt: true
          }
        }
      }
    })
  },

  listCourseChapterIds(courseId: string) {
    return prisma.chapter.findMany({
      where: {
        courseId
      },
      orderBy: {
        orderIndex: 'asc'
      },
      select: {
        id: true
      }
    })
  },

  listAdminCourses(data: { where: Prisma.CourseWhereInput; skip: number; take: number }) {
    return prisma.$transaction([
      prisma.course.findMany({
        where: data.where,
        skip: data.skip,
        take: data.take,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: {
          teacher: {
            select: {
              id: true,
              email: true,
              fullName: true
            }
          },
          thumbnailMedia: {
            select: {
              id: true,
              objectKey: true
            }
          }
        }
      }),
      prisma.course.count({
        where: data.where
      })
    ])
  },

  createCourse(data: {
    title: string
    slug: string
    description?: string
    subject: Subject
    grade: GradeValue
    teacherId: string
    thumbnailMediaId?: string | null
    price: number
    salePrice?: number | null
    allowPreview?: boolean
  }) {
    return prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        subject: data.subject,
        grade: data.grade,
        teacherId: data.teacherId,
        thumbnailMediaId: data.thumbnailMediaId,
        price: data.price,
        salePrice: data.salePrice,
        allowPreview: data.allowPreview
      },
      include: {
        teacher: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        thumbnailMedia: {
          select: {
            id: true,
            objectKey: true
          }
        }
      }
    })
  },

  updateCourse(data: {
    courseId: string
    title?: string
    description?: string | null
    subject?: Subject
    grade?: GradeValue
    teacherId?: string
    thumbnailMediaId?: string | null
    price?: number
    salePrice?: number | null
    allowPreview?: boolean
  }) {
    return prisma.course.update({
      where: {
        id: data.courseId
      },
      data: {
        title: data.title,
        description: data.description,
        subject: data.subject,
        grade: data.grade,
        teacherId: data.teacherId,
        thumbnailMediaId: data.thumbnailMediaId,
        price: data.price,
        salePrice: data.salePrice,
        allowPreview: data.allowPreview
      },
      include: {
        teacher: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        thumbnailMedia: {
          select: {
            id: true,
            objectKey: true
          }
        }
      }
    })
  },

  updateCourseStatus(courseId: string, status: CourseStatus) {
    return prisma.course.update({
      where: {
        id: courseId
      },
      data: {
        status
      },
      include: {
        teacher: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        thumbnailMedia: {
          select: {
            id: true,
            objectKey: true
          }
        }
      }
    })
  },

  async createChapter(data: { courseId: string; title: string }) {
    const aggregate = await prisma.chapter.aggregate({
      where: {
        courseId: data.courseId
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
  },

  updateChapter(data: { chapterId: string; title: string }) {
    return prisma.chapter.update({
      where: {
        id: data.chapterId
      },
      data: {
        title: data.title
      }
    })
  },

  deleteChapter(chapterId: string) {
    return prisma.chapter.delete({
      where: {
        id: chapterId
      }
    })
  },

async reorderChapters(courseId: string, chapterIds: string[]) {
  const operations = [
    // Chuỗi lệnh âm chạy tuần tự trước
    ...chapterIds.map((chapterId, index) =>
      prisma.chapter.update({
        where: { id: chapterId },
        data: { orderIndex: -(index + 1) }
      })
    ),
    // Chuỗi lệnh dương chạy tuần tự sau
    ...chapterIds.map((chapterId, index) =>
      prisma.chapter.update({
        where: { id: chapterId },
        data: { orderIndex: index + 1 }
      })
    )
  ];

  // Gửi toàn bộ mảng này sang DB chạy 1 lượt duy nhất trong transaction
  await prisma.$transaction(operations);

  // Trả về kết quả sau khi đã sắp xếp xong
  return prisma.chapter.findMany({
    where: { courseId },
    orderBy: { orderIndex: 'asc' },
    select: { id: true, orderIndex: true }
  });
},

  listCatalogCourses(data: { where: Prisma.CourseWhereInput; skip: number; take: number }) {
    return prisma.$transaction([
      prisma.course.findMany({
        where: data.where,
        skip: data.skip,
        take: data.take,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: {
          teacher: {
            select: {
              id: true,
              fullName: true
            }
          },
          thumbnailMedia: {
            select: {
              id: true,
              objectKey: true
            }
          }
        }
      }),
      prisma.course.count({
        where: data.where
      })
    ])
  },

  findPublishedCourseBySlug(slug: string) {
    return prisma.course.findFirst({
      where: {
        slug,
        status: CourseStatus.published,
        deletedAt: null
      },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true
          }
        },
        thumbnailMedia: {
          select: {
            id: true,
            objectKey: true
          }
        },
        chapters: {
          orderBy: {
            orderIndex: 'asc'
          },
          include: {
            lessons: {
              orderBy: {
                orderIndex: 'asc'
              },
              select: {
                id: true,
                title: true,
                type: true,
                durationSec: true,
                orderIndex: true
              }
            }
          }
        }
      }
    })
  }
}
