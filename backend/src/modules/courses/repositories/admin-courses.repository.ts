import { CourseStatus, UserRole, UserStatus, type Prisma, type Subject } from '@prisma/client'

import type { GradeValue } from '~/common/constant/taxonomy'
import { prisma } from '~/config/db'

import type {
  AdminCourseDetailRecord,
  AdminCourseRecord,
  AdminCourseRepositoryPort,
  ListAdminCoursesFilters
} from '../ports/admin-course-repository.port'
import { adminTeacherSelect, lessonVideoMediaSelect } from './shared'

const ADMIN_COURSE_INCLUDE = {
  teacher: {
    select: adminTeacherSelect
  },
  _count: {
    select: {
      enrollments: true
    }
  }
} satisfies Prisma.CourseInclude

type PrismaAdminCourse = Prisma.CourseGetPayload<{
  include: typeof ADMIN_COURSE_INCLUDE
}>

function buildAdminCourseWhere(filters: ListAdminCoursesFilters): Prisma.CourseWhereInput {
  const where: Prisma.CourseWhereInput = {
    deletedAt: null,
    status: filters.status,
    teacherId: filters.teacherId,
    isFeatured: filters.isFeatured
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { slug: { contains: filters.search, mode: 'insensitive' } }
    ]
  }

  return where
}

function mapToCourseRecord(course: PrismaAdminCourse): AdminCourseRecord {
  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    subject: course.subject,
    grade: course.grade as GradeValue,
    teacherId: course.teacherId,
    teacher: {
      id: course.teacher.id,
      fullName: course.teacher.fullName,
      email: course.teacher.email,
      avatarObjectKey: course.teacher.avatarObjectKey,
      avatarMediaId: course.teacher.avatarMediaId
    },
    thumbnailObjectKey: course.thumbnailObjectKey,
    thumbnailMediaId: course.thumbnailMediaId,
    price: course.price,
    salePrice: course.salePrice,
    status: course.status,
    isFeatured: course.isFeatured,
    totalLessons: course.totalLessons,
    enrolledCount: course._count?.enrollments ?? 0,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt
  }
}

export class PrismaAdminCourseRepository implements AdminCourseRepositoryPort {
  async findActiveCourseBySlug(slug: string) {
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

  async findActiveTeacherById(teacherId: string) {
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

  async findCourseById(courseId: string): Promise<AdminCourseRecord | null> {
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null
      },
      include: ADMIN_COURSE_INCLUDE
    })

    if (!course) return null
    return mapToCourseRecord(course)
  }

  async findCourseDetailById(courseId: string): Promise<AdminCourseDetailRecord | null> {
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null
      },
      include: {
        ...ADMIN_COURSE_INCLUDE,
        topics: {
          orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
          select: {
            id: true,
            name: true,
            parentId: true,
            courseId: true
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
                materials: {
                  where: { deletedAt: null },
                  select: {
                    id: true,
                    processingStatus: true
                  }
                },
                assessmentPlacements: {
                  where: { type: 'lesson' },
                  select: { assessmentId: true }
                }
              }
            }
          }
        }
      }
    })

    if (!course) return null

    return {
      ...mapToCourseRecord(course),
      topics: course.topics,
      chapters: course.chapters.map((chapter) => ({
        id: chapter.id,
        courseId: chapter.courseId,
        title: chapter.title,
        orderIndex: chapter.orderIndex,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt,
        lessons: chapter.lessons.map((lesson) => ({
          id: lesson.id,
          chapterId: lesson.chapterId,
          title: lesson.title,
          type: lesson.type,
          description: lesson.description,
          videoType: lesson.videoType,
          videoMediaId: lesson.videoMediaId,
          youtubeUrl: lesson.youtubeUrl,
          durationSec: lesson.durationSec,
          allowPreview: lesson.allowPreview,
          orderIndex: lesson.orderIndex,
          createdAt: lesson.createdAt,
          updatedAt: lesson.updatedAt,
          videoMedia: lesson.videoMedia
            ? {
                id: lesson.videoMedia.id,
                objectKey: lesson.videoMedia.objectKey,
                originalName: lesson.videoMedia.originalName,
                status: lesson.videoMedia.status,
                durationSec: lesson.videoMedia.durationSec
              }
            : null,
          assessmentId: lesson.assessmentPlacements[0]?.assessmentId ?? null,
          hasRagError: lesson.materials?.some((m) => m.processingStatus === 'failed') ?? false
        }))
      }))
    }
  }

  async listAdminCourses(data: {
    filters: ListAdminCoursesFilters
    page: number
    limit: number
  }): Promise<[AdminCourseRecord[], number]> {
    const where = buildAdminCourseWhere(data.filters)
    const skip = (data.page - 1) * data.limit

    const [courses, total] = await prisma.$transaction([
      prisma.course.findMany({
        where,
        skip,
        take: data.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: ADMIN_COURSE_INCLUDE
      }),
      prisma.course.count({
        where
      })
    ])

    return [courses.map(mapToCourseRecord), total]
  }

  async createCourse(data: {
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
  }): Promise<AdminCourseRecord> {
    const course = await prisma.course.create({
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
      include: ADMIN_COURSE_INCLUDE
    })

    return mapToCourseRecord(course)
  }

  async updateCourse(data: {
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
  }): Promise<AdminCourseRecord> {
    const course = await prisma.course.update({
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
      include: ADMIN_COURSE_INCLUDE
    })

    return mapToCourseRecord(course)
  }

  async updateCourseStatus(courseId: string, status: CourseStatus): Promise<AdminCourseRecord> {
    const course = await prisma.course.update({
      where: {
        id: courseId
      },
      data: {
        status
      },
      include: ADMIN_COURSE_INCLUDE
    })

    return mapToCourseRecord(course)
  }
}

export const adminCourseRepository = new PrismaAdminCourseRepository()
