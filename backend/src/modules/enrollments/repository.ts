import { Prisma, EnrollmentSource } from '@prisma/client'

import { prisma } from '~/config/db'
import type {
  EnrollmentRepositoryPort,
  ManualEnrollmentCourseRecord,
  ManualEnrollmentUserRecord,
  ManualEnrollmentRecord
} from './ports/enrollment-repository.port'

export class PrismaEnrollmentRepository implements EnrollmentRepositoryPort {
  async findCourseForManualEnrollment(
    courseId: string
  ): Promise<ManualEnrollmentCourseRecord | null> {
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        price: true,
        salePrice: true,
        teacherId: true,
        deletedAt: true
      }
    })
    if (!course) return null
    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      status: course.status,
      price: Number(course.price),
      salePrice: course.salePrice === null ? null : Number(course.salePrice),
      teacherId: course.teacherId,
      deletedAt: course.deletedAt
    }
  }

  async findUserForManualEnrollment(userId: string): Promise<ManualEnrollmentUserRecord | null> {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null
      },
      select: {
        id: true,
        role: true,
        status: true
      }
    })
    if (!user) return null
    return {
      id: user.id,
      role: user.role,
      status: user.status
    }
  }

  async findEnrollmentByUserAndCourse(data: { userId: string; courseId: string }) {
    return prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: data.userId,
          courseId: data.courseId
        }
      },
      select: {
        id: true
      }
    })
  }

  async createManualEnrollment(data: {
    userId: string
    courseId: string
    manualReason?: string
  }): Promise<ManualEnrollmentRecord> {
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: data.userId,
        courseId: data.courseId,
        source: EnrollmentSource.manual,
        orderId: null,
        manualReason: data.manualReason ?? null
      },
      select: {
        id: true,
        courseId: true,
        userId: true,
        source: true,
        orderId: true,
        manualReason: true,
        enrolledAt: true
      }
    })
    return {
      id: enrollment.id,
      courseId: enrollment.courseId,
      userId: enrollment.userId,
      source: enrollment.source,
      orderId: enrollment.orderId,
      manualReason: enrollment.manualReason,
      enrolledAt: enrollment.enrolledAt
    }
  }

  isUniqueConstraintError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
  }
}

export const enrollmentRepository = new PrismaEnrollmentRepository()
