import type { NotificationType } from '@prisma/client'

export type NotificationRecord = {
  id: string
  type: NotificationType
  title: string
  content: string | null
  linkUrl: string | null
  isRead: boolean
  createdAt: Date
}

export interface NotificationRepositoryPort {
  listForUser(data: {
    userId: string
    unreadOnly: boolean
    page: number
    limit: number
  }): Promise<[NotificationRecord[], number]>
  countUnread(userId: string): Promise<number>
  markRead(userId: string, notificationId: string): Promise<boolean>
  markAllRead(userId: string): Promise<number>
  createMany(
    notifications: Array<{
      userId: string
      type: NotificationType
      title: string
      content?: string | null
      linkUrl?: string | null
    }>
  ): Promise<number>
  listCourseStudentIds(courseId: string): Promise<string[]>
  findAssessmentNotificationContext(assessmentId: string): Promise<{
    graderIds: string[]
    courseTitle: string | null
  }>
}
