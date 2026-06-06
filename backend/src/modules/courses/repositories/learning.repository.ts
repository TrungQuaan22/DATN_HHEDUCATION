import { CourseStatus } from '@prisma/client'
import { prisma } from '~/config/db'

import type { LearningCourseRepositoryPort } from '../ports/learning-course-repository.port'
import { lessonAssessmentSelect, lessonVideoMediaSelect, publicTeacherSelect } from './shared'

export class PrismaLearningCourseRepository implements LearningCourseRepositoryPort {
  listEnrolledCourses(data: { userId: string; skip: number; take: number }) {
    const where = {
      userId: data.userId,
      course: {
        status: CourseStatus.published,
        deletedAt: null
      }
    }

    return prisma.$transaction([
      prisma.enrollment.findMany({
        where,
        orderBy: {
          enrolledAt: 'desc'
        },
        skip: data.skip,
        take: data.take,
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
                select: publicTeacherSelect
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
      }),
      prisma.enrollment.count({
        where
      })
    ])
  }

  findEnrolledCourseOverviewBySlug(data: { userId: string; courseSlug: string }) {
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
              select: publicTeacherSelect
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
                    orderIndex: true,
                    videoMedia: {
                      select: {
                        status: true
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

  findEnrolledLessonById(data: { userId: string; lessonId: string }) {
    return prisma.lesson.findFirst({
      where: {
        id: data.lessonId,
        deletedAt: null,
        chapter: {
          deletedAt: null,
          course: {
            status: CourseStatus.published,
            deletedAt: null,
            enrollments: {
              some: {
                userId: data.userId
              }
            }
          }
        }
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
          select: lessonVideoMediaSelect
        },
        lessonAssessments: {
          select: lessonAssessmentSelect
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
    })
  }

  findEnrolledSystemVideoLessonForHls(data: { userId: string; lessonId: string }) {
    return prisma.lesson.findFirst({
      where: {
        id: data.lessonId,
        deletedAt: null,
        type: 'video',
        videoType: 'system',
        chapter: {
          deletedAt: null,
          course: {
            status: CourseStatus.published,
            deletedAt: null,
            enrollments: {
              some: {
                userId: data.userId
              }
            }
          }
        }
      },
      select: {
        id: true,
        videoMedia: {
          select: {
            objectKey: true,
            status: true
          }
        }
      }
    })
  }

  findLessonForProgress(lessonId: string) {
    return prisma.lesson.findFirst({
      where: {
        id: lessonId,
        deletedAt: null
      },
      select: {
        id: true,
        durationSec: true,
        videoMedia: {
          select: {
            durationSec: true
          }
        },
        chapter: {
          select: {
            courseId: true,
            course: {
              select: {
                totalLessons: true,
                deletedAt: true
              }
            }
          }
        }
      }
    })
  }

  findEnrollment(userId: string, courseId: string) {
    return prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    })
  }

  findLessonProgress(userId: string, lessonId: string) {
    return prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      }
    })
  }

  async saveLessonAndCourseProgress(data: {
    userId: string
    lessonId: string
    courseId: string
    watchedSeconds: number
    lastPositionSec: number
    durationSec: number
    isCompleted: boolean
    completedAt: Date | null
    newlyCompleted: boolean
    now: Date
  }) {
    return prisma.$transaction(async (tx) => {
      const progress = await tx.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: data.userId,
            lessonId: data.lessonId
          }
        },
        create: {
          userId: data.userId,
          lessonId: data.lessonId,
          watchedSeconds: data.watchedSeconds,
          lastPositionSec: data.lastPositionSec,
          durationSec: data.durationSec,
          isCompleted: data.isCompleted,
          completedAt: data.completedAt
        },
        update: {
          watchedSeconds: data.watchedSeconds,
          lastPositionSec: data.lastPositionSec,
          durationSec: data.durationSec,
          isCompleted: data.isCompleted,
          completedAt: data.completedAt
        }
      })

      const courseProgress = await tx.courseProgress.upsert({
        where: {
          userId_courseId: {
            userId: data.userId,
            courseId: data.courseId
          }
        },
        create: {
          userId: data.userId,
          courseId: data.courseId,
          completedLessons: data.newlyCompleted ? 1 : 0,
          lastLearnedAt: data.now
        },
        update: {
          completedLessons: data.newlyCompleted
            ? {
                increment: 1
              }
            : undefined,
          lastLearnedAt: data.now
        },
        select: {
          completedLessons: true
        }
      })

      return {
        watchedSeconds: progress.watchedSeconds,
        lastPositionSec: progress.lastPositionSec,
        isCompleted: progress.isCompleted,
        completedLessons: courseProgress.completedLessons
      }
    })
  }
}

export const learningCourseRepository = new PrismaLearningCourseRepository()
