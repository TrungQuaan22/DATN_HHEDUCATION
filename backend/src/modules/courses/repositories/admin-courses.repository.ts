import {
  CourseStatus,
  MediaStatus,
  UserRole,
  UserStatus,
  type Prisma,
  type Subject
} from '@prisma/client'

import type { GradeValue } from '~/common/constant/taxonomy'
import { prisma } from '~/config/db'

import type { AdminCourseRepositoryPort } from '../ports/admin-course-repository.port'
import { adminTeacherSelect, lessonAssessmentSelect, lessonVideoMediaSelect } from './shared'

export class PrismaAdminCourseRepository implements AdminCourseRepositoryPort {
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
  }

  findDraftOrPublishedCourseByTitle(data: { title: string; excludeCourseId?: string }) {
    return prisma.course.findFirst({
      where: {
        title: {
          equals: data.title,
          mode: 'insensitive'
        },
        status: {
          in: [CourseStatus.draft, CourseStatus.published]
        },
        deletedAt: null,
        id: data.excludeCourseId ? { not: data.excludeCourseId } : undefined
      },
      select: {
        id: true
      }
    })
  }

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
  }

  findCourseById(courseId: string) {
    return prisma.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null
      },
      include: {
        teacher: {
          select: adminTeacherSelect
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    })
  }

  findCourseDetailById(courseId: string) {
    return prisma.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null
      },
      include: {
        teacher: {
          select: adminTeacherSelect
        },
        _count: {
          select: {
            enrollments: true
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
            courseId: true,
            title: true,
            orderIndex: true,
            createdAt: true,
            updatedAt: true,
            lessons: {
              where: {
                deletedAt: null
              },
              orderBy: {
                orderIndex: 'asc'
              },
              select: {
                id: true,
                chapterId: true,
                title: true,
                type: true,
                description: true,
                videoType: true,
                videoMediaId: true,
                youtubeUrl: true,
                durationSec: true,
                allowPreview: true,
                orderIndex: true,
                createdAt: true,
                updatedAt: true,
                videoMedia: {
                  select: lessonVideoMediaSelect
                },
                lessonAssessments: {
                  select: lessonAssessmentSelect
                }
              }
            }
          }
        }
      }
    })
  }

  listAdminCourses(data: { where: Prisma.CourseWhereInput; skip: number; take: number }) {
    return prisma.$transaction([
      prisma.course.findMany({
        where: data.where,
        skip: data.skip,
        take: data.take,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: {
          teacher: {
            select: adminTeacherSelect
          },
          _count: {
            select: {
              enrollments: true
            }
          }
        }
      }),
      prisma.course.count({
        where: data.where
      })
    ])
  }

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
          select: adminTeacherSelect
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    })
  }

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
          select: adminTeacherSelect
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    })
  }

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
          select: adminTeacherSelect
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    })
  }

  listUnreadySystemVideoLessons(courseId: string) {
    return prisma.lesson.findMany({
      where: {
        deletedAt: null,
        type: 'video',
        videoType: 'system',
        chapter: {
          courseId,
          deletedAt: null
        },
        OR: [
          {
            videoMediaId: null
          },
          {
            videoMedia: {
              is: {
                status: {
                  not: MediaStatus.ready
                }
              }
            }
          }
        ]
      },
      orderBy: [
        {
          chapter: {
            orderIndex: 'asc'
          }
        },
        {
          orderIndex: 'asc'
        }
      ],
      select: {
        id: true,
        title: true,
        videoMediaId: true,
        videoMedia: {
          select: {
            status: true
          }
        },
        chapter: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })
  }
}

export const adminCourseRepository = new PrismaAdminCourseRepository()
