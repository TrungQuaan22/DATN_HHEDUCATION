import {
  CourseStatus,
  UserRole,
  UserStatus,
  type LessonType,
  type Prisma,
  type Subject,
  type VideoType
} from '@prisma/client'

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
            fullName: true,
            avatarMediaId: true,
            avatarObjectKey: true
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
            fullName: true,
            avatarMediaId: true,
            avatarObjectKey: true
          }
        },
        chapters: {
          where: {
            deletedAt: null
          },
          orderBy: {
            orderIndex: 'asc'
          },
          include: {
            lessons: {
              where: {
                deletedAt: null
              },
              orderBy: {
                orderIndex: 'asc'
              },
              include: {
                videoMedia: {
                  select: {
                    id: true,
                    objectKey: true
                  }
                },
                lessonAssessments: {
                  select: {
                    assessmentId: true
                  }
                }
              }
            }
          }
        }
      }
    })
  },

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
  },

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
          select: {
            id: true,
            objectKey: true
          }
        },
        lessonAssessments: {
          select: {
            assessmentId: true
          }
        }
      }
    })
  },

  findAssessmentById(assessmentId: string) {
    return prisma.assessment.findUnique({
      where: {
        id: assessmentId
      },
      select: {
        id: true
      }
    })
  },

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
  },

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
              fullName: true,
              avatarMediaId: true,
              avatarObjectKey: true
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
    thumbnailObjectKey?: string | null
    price: number
    salePrice?: number | null
    isFeatured?: boolean
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
        thumbnailObjectKey: data.thumbnailObjectKey,
        price: data.price,
        salePrice: data.salePrice,
        isFeatured: data.isFeatured
      },
      include: {
        teacher: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarMediaId: true,
            avatarObjectKey: true
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
    thumbnailObjectKey?: string | null
    price?: number
    salePrice?: number | null
    isFeatured?: boolean
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
        thumbnailObjectKey: data.thumbnailObjectKey,
        price: data.price,
        salePrice: data.salePrice,
        isFeatured: data.isFeatured
      },
      include: {
        teacher: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarMediaId: true,
            avatarObjectKey: true
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
            fullName: true,
            avatarMediaId: true,
            avatarObjectKey: true
          }
        }
      }
    })
  },

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
  },

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
            select: {
              id: true,
              objectKey: true
            }
          },
          lessonAssessments: {
            select: {
              assessmentId: true
            }
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
  },

  countActiveLessonsByChapter(chapterId: string) {
    return prisma.lesson.count({
      where: {
        chapterId,
        deletedAt: null
      }
    })
  },

  async updateLesson(data: {
    lessonId: string
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
      await tx.lesson.update({
        where: {
          id: data.lessonId
        },
        data: {
          title: data.title,
          type: data.type,
          description: data.description,
          videoType: data.videoType,
          videoMediaId: data.videoMediaId,
          youtubeUrl: data.youtubeUrl,
          durationSec: data.durationSec,
          allowPreview: data.allowPreview
        }
      })

      if (data.assessmentId) {
        await tx.lessonAssessment.upsert({
          where: {
            lessonId: data.lessonId
          },
          update: {
            assessmentId: data.assessmentId
          },
          create: {
            lessonId: data.lessonId,
            assessmentId: data.assessmentId
          }
        })
      } else {
        await tx.lessonAssessment.deleteMany({
          where: {
            lessonId: data.lessonId
          }
        })
      }

      return tx.lesson.findUniqueOrThrow({
        where: {
          id: data.lessonId
        },
        include: {
          videoMedia: {
            select: {
              id: true,
              objectKey: true
            }
          },
          lessonAssessments: {
            select: {
              assessmentId: true
            }
          }
        }
      })
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
      const aggregate = await tx.chapter.aggregate({
        where: {
          orderIndex: {
            lt: 0
          }
        },
        _min: {
          orderIndex: true
        }
      })

      const deletedChapter = await tx.chapter.update({
        where: {
          id: chapterId
        },
        data: {
          deletedAt: new Date(),
          orderIndex: (aggregate._min.orderIndex ?? 0) - 1
        }
      })

      await tx.chapter.updateMany({
        where: {
          courseId: chapter.courseId,
          deletedAt: null,
          orderIndex: {
            gt: chapter.orderIndex
          }
        },
        data: {
          orderIndex: {
            decrement: 1
          }
        }
      })

      return deletedChapter
    })
  },

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
      const aggregate = await tx.lesson.aggregate({
        where: {
          orderIndex: {
            lt: 0
          }
        },
        _min: {
          orderIndex: true
        }
      })

      const lesson = await tx.lesson.update({
        where: {
          id: data.lessonId
        },
        data: {
          deletedAt: new Date(),
          orderIndex: (aggregate._min.orderIndex ?? 0) - 1
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

      await tx.lesson.updateMany({
        where: {
          chapterId: currentLesson.chapterId,
          deletedAt: null,
          orderIndex: {
            gt: currentLesson.orderIndex
          }
        },
        data: {
          orderIndex: {
            decrement: 1
          }
        }
      })

      return lesson
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
    ]

    // Gửi toàn bộ mảng này sang DB chạy 1 lượt duy nhất trong transaction
    await prisma.$transaction(operations)

    // Trả về kết quả sau khi đã sắp xếp xong
    return prisma.chapter.findMany({
      where: { courseId, deletedAt: null },
      orderBy: { orderIndex: 'asc' },
      select: { id: true, orderIndex: true }
    })
  },

  async reorderLessons(chapterId: string, lessonIds: string[]) {
    const operations = [
      ...lessonIds.map((lessonId, index) =>
        prisma.lesson.update({
          where: { id: lessonId },
          data: { orderIndex: -(index + 1) }
        })
      ),
      ...lessonIds.map((lessonId, index) =>
        prisma.lesson.update({
          where: { id: lessonId },
          data: { orderIndex: index + 1 }
        })
      )
    ]

    await prisma.$transaction(operations)

    return prisma.lesson.findMany({
      where: { chapterId, deletedAt: null },
      orderBy: { orderIndex: 'asc' },
      select: { id: true, orderIndex: true }
    })
  },

  listCatalogCourses(data: {
    where: Prisma.CourseWhereInput
    skip: number
    take: number
    orderBy: Prisma.CourseOrderByWithRelationInput[]
  }) {
    return prisma.$transaction([
      prisma.course.findMany({
        where: data.where,
        skip: data.skip,
        take: data.take,
        orderBy: data.orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          subject: true,
          grade: true,
          thumbnailObjectKey: true,
          price: true,
          salePrice: true,
          status: true,
          isFeatured: true,
          totalLessons: true,
          createdAt: true,
          updatedAt: true,
          teacher: {
            select: {
              id: true,
              fullName: true,
              avatarObjectKey: true
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
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        subject: true,
        grade: true,
        thumbnailObjectKey: true,
        price: true,
        salePrice: true,
        status: true,
        isFeatured: true,
        totalLessons: true,
        createdAt: true,
        updatedAt: true,
        teacher: {
          select: {
            id: true,
            fullName: true,
            avatarObjectKey: true
          }
        },
        chapters: {
          where: {
            deletedAt: null
          },
          orderBy: {
            orderIndex: 'asc'
          },
          select: {
            id: true,
            title: true,
            orderIndex: true,
            lessons: {
              where: {
                deletedAt: null
              },
              orderBy: {
                orderIndex: 'asc'
              },
              select: {
                id: true,
                title: true,
                type: true,
                durationSec: true,
                allowPreview: true,
                orderIndex: true
              }
            }
          }
        }
      }
    })
  },

  listRelatedCatalogCourses(data: { courseId: string; grade: number; take: number }) {
    return prisma.course.findMany({
      where: {
        id: {
          not: data.courseId
        },
        status: CourseStatus.published,
        deletedAt: null,
        grade: data.grade,
        isFeatured: true
      },
      take: data.take,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        subject: true,
        grade: true,
        thumbnailObjectKey: true,
        price: true,
        salePrice: true,
        status: true,
        isFeatured: true,
        totalLessons: true,
        createdAt: true,
        updatedAt: true,
        teacher: {
          select: {
            id: true,
            fullName: true,
            avatarObjectKey: true
          }
        }
      }
    })
  },

  // Returns lightweight published courses that the student can access in the learning area.
  // This list API intentionally avoids joining chapters/lessons; totalLessons comes from Course.
  listEnrolledCourses(userId: string) {
    return prisma.enrollment.findMany({
      where: {
        userId,
        course: {
          status: CourseStatus.published,
          deletedAt: null
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      },
      select: {
        enrolledAt: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            subject: true,
            grade: true,
            thumbnailObjectKey: true,
            price: true,
            salePrice: true,
            isFeatured: true,
            totalLessons: true,
            teacher: {
              select: {
                id: true,
                fullName: true,
                avatarObjectKey: true
              }
            },
            courseProgress: {
              where: {
                userId
              },
              take: 1,
              select: {
                completedLessons: true,
                lastLearnedAt: true
              }
            }
          }
        }
      }
    })
  },

  // Loads one enrolled course with lesson metadata and the student's progress.
  findEnrolledCourseBySlug(data: { userId: string; courseSlug: string }) {
    return prisma.enrollment.findFirst({
      where: {
        userId: data.userId,
        course: {
          slug: data.courseSlug,
          status: CourseStatus.published,
          deletedAt: null
        }
      },
      select: {
        enrolledAt: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            subject: true,
            grade: true,
            thumbnailObjectKey: true,
            price: true,
            salePrice: true,
            isFeatured: true,
            totalLessons: true,
            teacher: {
              select: {
                id: true,
                fullName: true,
                avatarObjectKey: true
              }
            },
            chapters: {
              where: {
                deletedAt: null
              },
              orderBy: {
                orderIndex: 'asc'
              },
              select: {
                id: true,
                title: true,
                orderIndex: true,
                lessons: {
                  where: {
                    deletedAt: null
                  },
                  orderBy: {
                    orderIndex: 'asc'
                  },
                  select: {
                    id: true,
                    title: true,
                    type: true,
                    description: true,
                    videoType: true,
                    youtubeUrl: true,
                    durationSec: true,
                    allowPreview: true,
                    orderIndex: true,
                    videoMedia: {
                      select: {
                        id: true,
                        objectKey: true
                      }
                    },
                    lessonAssessments: {
                      select: {
                        assessmentId: true
                      }
                    },
                    progress: {
                      where: {
                        userId: data.userId
                      },
                      take: 1,
                      select: {
                        watchedSeconds: true,
                        lastPositionSec: true,
                        isCompleted: true
                      }
                    }
                  }
                }
              }
            },
            courseProgress: {
              where: {
                userId: data.userId
              },
              take: 1,
              select: {
                completedLessons: true,
                lastLearnedAt: true
              }
            }
          }
        }
      }
    })
  }
}
