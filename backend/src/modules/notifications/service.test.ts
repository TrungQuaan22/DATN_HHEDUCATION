import assert from 'node:assert/strict'
import test from 'node:test'
import { NotificationType } from '@prisma/client'

import type {
  NotificationRecord,
  NotificationRepositoryPort
} from './ports/notification-repository.port'
import { NotificationEventService, NotificationService } from './service'

type NewNotification = Parameters<NotificationRepositoryPort['createMany']>[0][number]

class InMemoryNotificationRepository implements NotificationRepositoryPort {
  readonly created: NewNotification[] = []
  courseStudentIds: string[] = []
  assessmentContext = { graderIds: [] as string[], courseTitle: null as string | null }

  listForUser(): Promise<[NotificationRecord[], number]> {
    return Promise.resolve([[], 0])
  }

  countUnread(): Promise<number> {
    return Promise.resolve(this.created.length)
  }

  markRead(_userId: string, notificationId: string): Promise<boolean> {
    return Promise.resolve(this.created.some((item) => item.linkUrl?.includes(notificationId)))
  }

  markAllRead(): Promise<number> {
    return Promise.resolve(this.created.length)
  }

  createMany(notifications: NewNotification[]): Promise<number> {
    this.created.push(...notifications)
    return Promise.resolve(notifications.length)
  }

  listCourseStudentIds(): Promise<string[]> {
    return Promise.resolve(this.courseStudentIds)
  }

  findAssessmentNotificationContext(): Promise<{
    graderIds: string[]
    courseTitle: string | null
  }> {
    return Promise.resolve(this.assessmentContext)
  }
}

test('creates one new-lesson notification for every enrolled student', async () => {
  const repository = new InMemoryNotificationRepository()
  repository.courseStudentIds = ['student-1', 'student-2']
  const service = new NotificationEventService(repository)

  await service.notifyCourseStudentsAboutNewLesson({
    courseId: 'course-1',
    courseTitle: 'Toán 12',
    courseSlug: 'toan-12',
    lessonId: 'lesson-1',
    lessonTitle: 'Khảo sát hàm số'
  })

  assert.deepEqual(
    repository.created.map((item) => item.userId),
    ['student-1', 'student-2']
  )
  assert.equal(repository.created[0].type, NotificationType.new_lesson)
  assert.equal(repository.created[0].linkUrl, '/student/courses/toan-12?lessonId=lesson-1')
})

test('notifies every eligible grader when an essay submission is received', async () => {
  const repository = new InMemoryNotificationRepository()
  repository.assessmentContext = {
    graderIds: ['admin-1', 'teacher-1'],
    courseTitle: 'Ngữ văn 12'
  }
  const service = new NotificationEventService(repository)

  await service.notifyGradersAboutEssaySubmission({
    assessmentId: 'assessment-1',
    assessmentTitle: 'Nghị luận xã hội',
    studentId: 'student-1',
    studentName: 'Nguyễn Văn An'
  })

  assert.deepEqual(
    repository.created.map((item) => item.userId),
    ['admin-1', 'teacher-1']
  )
  assert.equal(repository.created[0].type, NotificationType.essay_submission)
  assert.equal(repository.created[0].linkUrl, '/admin/assessments/assessment-1/results/student-1')
})

test('links a graded notification to the protected student result page', async () => {
  const repository = new InMemoryNotificationRepository()
  const service = new NotificationEventService(repository)

  await service.notifyStudentAboutGradedSubmission({
    studentId: 'student-1',
    assessmentTitle: 'Đại số',
    placementId: 'placement-1',
    submissionId: 'submission-1',
    finalScore: '8.5'
  })

  assert.equal(repository.created.length, 1)
  assert.equal(repository.created[0].type, NotificationType.graded)
  assert.equal(
    repository.created[0].linkUrl,
    '/student/assessments/placement-1/results/submission-1'
  )
})

test('returns unread count together with paginated notifications', async () => {
  const repository = new InMemoryNotificationRepository()
  repository.created.push({
    userId: 'student-1',
    type: NotificationType.graded,
    title: 'Đã chấm bài'
  })
  const service = new NotificationService(repository)

  const result = await service.list({
    userId: 'student-1',
    unreadOnly: false,
    page: 1,
    limit: 10
  })

  assert.equal(result.unreadCount, 1)
  assert.equal(result.pagination.totalPages, 0)
})
