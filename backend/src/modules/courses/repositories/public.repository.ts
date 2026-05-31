import { CourseStatus, type Prisma } from '@prisma/client'

import { prisma } from '~/config/db'

import { publicTeacherSelect } from './shared'
import type { PublicCourseRepositoryPort } from '../ports/public-course-repository.port'

export class PrismaPublicCourseRepository implements PublicCourseRepositoryPort {
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
            select: publicTeacherSelect
          }
        }
      }),
      prisma.course.count({
        where: data.where
      })
    ])
  }

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
                youtubeUrl: true,
                durationSec: true,
                allowPreview: true,
                orderIndex: true
              }
            }
          }
        }
      }
    })
  }

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
          select: publicTeacherSelect
        }
      }
    })
  }
}

export const publicCourseRepository = new PrismaPublicCourseRepository()
