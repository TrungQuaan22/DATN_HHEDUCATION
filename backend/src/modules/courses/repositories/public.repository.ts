import { CourseStatus, type Prisma } from '@prisma/client'

import { prisma } from '~/config/db'

import { publicTeacherSelect } from './shared'
import type {
  CatalogCourseSort,
  ListCatalogCoursesFilters,
  PublicCourseRepositoryPort
} from '../ports/public-course-repository.port'

function buildCatalogCourseWhere(filters: ListCatalogCoursesFilters): Prisma.CourseWhereInput {
  const where: Prisma.CourseWhereInput = {
    status: CourseStatus.published,
    deletedAt: null,
    subject: filters.subjects ? { in: filters.subjects } : undefined,
    isFeatured: filters.featured,
    grade: filters.grade
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { slug: { contains: filters.search, mode: 'insensitive' } }
    ]
  }

  return where
}

function buildCatalogCourseOrderBy(
  sort: CatalogCourseSort
): Prisma.CourseOrderByWithRelationInput[] {
  switch (sort) {
    case 'hotest':
      return [{ isFeatured: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }]
    case 'priceAsc':
      return [{ salePrice: 'asc' }, { price: 'asc' }, { createdAt: 'desc' }, { id: 'desc' }]
    case 'priceDesc':
      return [{ salePrice: 'desc' }, { price: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }]
    default:
      return [{ createdAt: 'desc' }, { id: 'desc' }]
  }
}

export class PrismaPublicCourseRepository implements PublicCourseRepositoryPort {
  listCatalogCourses(data: {
    filters: ListCatalogCoursesFilters
    sort: CatalogCourseSort
    page: number
    limit: number
  }) {
    const where = buildCatalogCourseWhere(data.filters)
    const skip = (data.page - 1) * data.limit

    return prisma.$transaction([
      prisma.course.findMany({
        where,
        skip,
        take: data.limit,
        orderBy: buildCatalogCourseOrderBy(data.sort),
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
        where
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

  listRelatedCatalogCourses(data: { courseId: string; grade: number; limit: number }) {
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
      take: data.limit,
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
