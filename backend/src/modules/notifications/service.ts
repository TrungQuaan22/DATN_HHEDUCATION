import { NotificationType } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

import type { NotificationRepositoryPort } from './ports/notification-repository.port'
import { notificationRepository } from './repository'

export class NotificationService {
  constructor(private readonly repository: NotificationRepositoryPort) {}

  async list(data: { userId: string; unreadOnly: boolean; page: number; limit: number }) {
    const [items, totalItems] = await this.repository.listForUser(data)
    const unreadCount = await this.repository.countUnread(data.userId)
    return {
      items,
      unreadCount,
      pagination: {
        page: data.page,
        limit: data.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / data.limit)
      }
    }
  }

  async getUnreadCount(userId: string) {
    return { unreadCount: await this.repository.countUnread(userId) }
  }

  async markRead(userId: string, notificationId: string) {
    const updated = await this.repository.markRead(userId, notificationId)
    if (!updated) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Notification not found')
    }
    return { notificationId, isRead: true }
  }

  async markAllRead(userId: string) {
    return { updatedCount: await this.repository.markAllRead(userId) }
  }
}

export class NotificationEventService {
  constructor(private readonly repository: NotificationRepositoryPort) {}

  private async createMany(notifications: Parameters<NotificationRepositoryPort['createMany']>[0]) {
    try {
      await this.repository.createMany(notifications)
    } catch (error) {
      console.error('[notifications] Failed to create business notifications', error)
    }
  }

  async notifyCourseStudentsAboutNewLesson(data: {
    courseId: string
    courseTitle: string
    courseSlug: string
    lessonId: string
    lessonTitle: string
  }) {
    const studentIds = await this.repository.listCourseStudentIds(data.courseId)
    await this.createMany(
      studentIds.map((userId) => ({
        userId,
        type: NotificationType.new_lesson,
        title: `Bài học mới trong ${data.courseTitle}`,
        content: `Bài “${data.lessonTitle}” vừa được thêm vào khóa học của bạn.`,
        linkUrl: `/student/courses/${data.courseSlug}?lessonId=${data.lessonId}`
      }))
    )
  }

  async notifyGradersAboutEssaySubmission(data: {
    assessmentId: string
    assessmentTitle: string
    studentId: string
    studentName: string
  }) {
    const context = await this.repository.findAssessmentNotificationContext(data.assessmentId)
    await this.createMany(
      context.graderIds.map((userId) => ({
        userId,
        type: NotificationType.essay_submission,
        title: 'Có bài tự luận mới cần chấm',
        content: `${data.studentName} đã nộp “${data.assessmentTitle}”${context.courseTitle ? ` trong khóa ${context.courseTitle}` : ''}.`,
        linkUrl: `/admin/assessments/${data.assessmentId}/results/${data.studentId}`
      }))
    )
  }

  async notifyStudentAboutGradedSubmission(data: {
    studentId: string
    assessmentTitle: string
    placementId: string | null
    submissionId: string
    finalScore: string
  }) {
    await this.createMany([
      {
        userId: data.studentId,
        type: NotificationType.graded,
        title: 'Bài kiểm tra đã được chấm',
        content: `Kết quả “${data.assessmentTitle}” đã có: ${data.finalScore} điểm.`,
        linkUrl: data.placementId
          ? `/student/assessments/${data.placementId}/results/${data.submissionId}`
          : '/student/assessments'
      }
    ])
  }
}

export const notificationService = new NotificationService(notificationRepository)
export const notificationEventService = new NotificationEventService(notificationRepository)
