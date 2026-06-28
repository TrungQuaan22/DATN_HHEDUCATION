import { UserRole, UserStatus } from '@prisma/client'

import { prisma } from '~/config/db'

import type { NotificationRepositoryPort } from './ports/notification-repository.port'

export class PrismaNotificationRepository implements NotificationRepositoryPort {
  async listForUser(data: { userId: string; unreadOnly: boolean; page: number; limit: number }) {
    const where = {
      userId: data.userId,
      isRead: data.unreadOnly ? false : undefined
    }
    return prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (data.page - 1) * data.limit,
        take: data.limit
      }),
      prisma.notification.count({ where })
    ])
  }

  countUnread(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } })
  }

  async markRead(userId: string, notificationId: string) {
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true }
    })
    return result.count > 0
  }

  async markAllRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    })
    return result.count
  }

  async createMany(notifications: Parameters<NotificationRepositoryPort['createMany']>[0]) {
    if (notifications.length === 0) return 0
    const result = await prisma.notification.createMany({ data: notifications })
    return result.count
  }

  async listCourseStudentIds(courseId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        user: {
          role: UserRole.student,
          status: UserStatus.active,
          deletedAt: null
        }
      },
      select: { userId: true }
    })
    return enrollments.map((enrollment) => enrollment.userId)
  }

  async findAssessmentNotificationContext(assessmentId: string) {
    const [assessment, admins] = await Promise.all([
      prisma.assessment.findUnique({
        where: { id: assessmentId },
        select: {
          createdById: true,
          placements: {
            take: 1,
            select: {
              course: { select: { title: true, teacherId: true } },
              lesson: {
                select: {
                  chapter: {
                    select: { course: { select: { title: true, teacherId: true } } }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.user.findMany({
        where: { role: UserRole.admin, status: UserStatus.active, deletedAt: null },
        select: { id: true }
      })
    ])
    const placement = assessment?.placements[0]
    const course = placement?.course ?? placement?.lesson?.chapter.course ?? null
    const graderIds = new Set(admins.map((admin) => admin.id))
    if (assessment?.createdById) graderIds.add(assessment.createdById)
    if (course?.teacherId) graderIds.add(course.teacherId)

    return {
      graderIds: [...graderIds],
      courseTitle: course?.title ?? null
    }
  }
}

export const notificationRepository = new PrismaNotificationRepository()
