import { EnrollmentSource } from '@prisma/client'

import { prisma } from '~/config/db'
import type { EnrollmentRepositoryPort } from './ports/enrollment-repository.port'

export class PrismaEnrollmentRepository implements EnrollmentRepositoryPort {
  findCourseForManualEnrollment(courseId: string) {
    return prisma.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null
      },
      select: {
        id: true,
        status: true
      }
    })
  }

  findUserForManualEnrollment(userId: string) {
    return prisma.user.findFirst({
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
  }

  findEnrollmentByUserAndCourse(data: { userId: string; courseId: string }) {
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

  createManualEnrollment(data: { userId: string; courseId: string; manualReason?: string }) {
    return prisma.enrollment.create({
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
  }
}

export const enrollmentRepository = new PrismaEnrollmentRepository()
