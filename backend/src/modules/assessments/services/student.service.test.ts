import assert from 'node:assert/strict'
import test from 'node:test'
import {
  AssessmentItemType,
  AssessmentPlacementType,
  AiStatus,
  EnrollmentSource,
  NotificationType,
  Prisma,
  SubmissionStatus,
  type Enrollment
} from '@prisma/client'

import type { NotificationRepositoryPort } from '~/modules/notifications/ports/notification-repository.port'
import { NotificationEventService } from '~/modules/notifications/service'
import type { StudentAssessmentRepositoryPort } from '../ports/student-assessment-repository.port'
import type {
  RuntimePlacement,
  RuntimePreviewPlacement,
  StudentPlacementListItem,
  StudentSubmissionComplete,
  SubmissionDetail,
  SubmissionWorkspaceGate
} from '../types'
import { StudentAssessmentService } from './student.service'

type FinalizeData = Parameters<StudentAssessmentRepositoryPort['finalizeSubmission']>[0]
type NewNotification = Parameters<NotificationRepositoryPort['createMany']>[0][number]

const submissionId = '00000000-0000-0000-0000-000000000001'
const itemId = '00000000-0000-0000-0000-000000000002'

function createExpiredSubmission(itemType: AssessmentItemType): StudentSubmissionComplete {
  const hasMcqAnswer = itemType === AssessmentItemType.mcq

  return {
    id: submissionId,
    assessmentId: '00000000-0000-0000-0000-000000000003',
    placementId: '00000000-0000-0000-0000-000000000004',
    studentId: '00000000-0000-0000-0000-000000000005',
    attemptNumber: 1,
    startTime: new Date('2026-06-01T08:00:00.000Z'),
    submitTime: null,
    status: SubmissionStatus.doing,
    version: 0,
    autoScore: null,
    finalScore: null,
    violationCount: 0,
    createdAt: new Date('2026-06-01T08:00:00.000Z'),
    updatedAt: new Date('2026-06-01T08:00:00.000Z'),
    mcqAnswers: hasMcqAnswer
      ? [
          {
            id: '00000000-0000-0000-0000-000000000006',
            submissionId,
            itemId,
            isCorrect: null,
            pointEarned: new Prisma.Decimal(0),
            selectedOptions: [
              {
                id: '00000000-0000-0000-0000-000000000007',
                answerId: '00000000-0000-0000-0000-000000000006',
                optionId: '00000000-0000-0000-0000-000000000008'
              }
            ]
          }
        ]
      : [],
    tfAnswers: [],
    numericAnswers: [],
    essayAnswers: [],
    assessment: {
      id: '00000000-0000-0000-0000-000000000003',
      title: 'Bài kiểm tra cuối kỳ',
      timeLimitMinutes: 45,
      sections: [
        {
          items: [
            {
              id: itemId,
              itemType,
              maxScore: new Prisma.Decimal(1),
              scoringConfig: null,
              correctAnswer: null,
              question: {
                options: hasMcqAnswer
                  ? [
                      {
                        id: '00000000-0000-0000-0000-000000000008',
                        isCorrect: true
                      }
                    ]
                  : []
              }
            }
          ]
        }
      ]
    },
    placement: {
      id: '00000000-0000-0000-0000-000000000004',
      type: AssessmentPlacementType.course,
      closeTime: new Date('2026-06-01T10:00:00.000Z')
    },
    student: {
      id: '00000000-0000-0000-0000-000000000005',
      fullName: 'Nguyễn Văn An',
      email: 'student@example.com'
    }
  } as unknown as StudentSubmissionComplete
}

class InMemoryStudentAssessmentRepository implements StudentAssessmentRepositoryPort {
  constructor(public storedSubmission: StudentSubmissionComplete) {}

  lastFinalize: FinalizeData | null = null

  listStudentAssessmentPlacements(): Promise<[StudentPlacementListItem[], number]> {
    return Promise.resolve([[], 0])
  }

  findRuntimePlacementById(): Promise<RuntimePlacement | null> {
    return Promise.resolve(null)
  }

  findRuntimePreviewPlacementById(): Promise<RuntimePreviewPlacement | null> {
    return Promise.resolve(null)
  }

  findSubmissionWorkspaceGate(): Promise<SubmissionWorkspaceGate | null> {
    return Promise.resolve(null)
  }

  findEnrollmentForPlacement(): Promise<Enrollment | null> {
    return Promise.resolve({
      id: '00000000-0000-0000-0000-000000000030',
      userId: this.storedSubmission.studentId,
      courseId: '00000000-0000-0000-0000-000000000031',
      orderId: null,
      source: EnrollmentSource.payment,
      manualReason: null,
      enrolledAt: new Date('2026-01-01T00:00:00.000Z')
    })
  }

  findEnrollmentForLessonPlacement(): Promise<Enrollment | null> {
    return Promise.resolve(null)
  }

  countAttempts(): Promise<number> {
    return Promise.resolve(1)
  }

  findDoingSubmissionForPlacement(): Promise<SubmissionDetail | null> {
    return Promise.resolve(null)
  }

  createSubmission(): Promise<SubmissionDetail> {
    throw new Error('Not used in this test')
  }

  findSubmissionForStudent(): Promise<StudentSubmissionComplete | null> {
    return Promise.resolve(this.storedSubmission)
  }

  listExpiredDoingSubmissions(): Promise<StudentSubmissionComplete[]> {
    return Promise.resolve([this.storedSubmission])
  }

  saveAnswers(): Promise<void> {
    return Promise.resolve()
  }

  recordViolation(): Promise<StudentSubmissionComplete | null> {
    this.storedSubmission = {
      ...this.storedSubmission,
      violationCount: this.storedSubmission.violationCount + 1
    }
    return Promise.resolve(this.storedSubmission)
  }

  finalizeSubmission(data: FinalizeData): Promise<{
    submission: StudentSubmissionComplete
    didFinalize: boolean
  }> {
    this.lastFinalize = data
    const essayAnswers = data.essayItemIds.map((essayItemId, index) => ({
      id: `00000000-0000-0000-0000-${(index + 20).toString().padStart(12, '0')}`,
      submissionId,
      itemId: essayItemId,
      answer: '',
      aiSummary: null,
      aiStatus: AiStatus.none,
      teacherScore: null,
      teacherNote: null,
      gradedBy: null,
      gradedAt: null
    }))

    this.storedSubmission = {
      ...this.storedSubmission,
      status: data.status,
      submitTime: new Date('2026-06-01T08:45:00.000Z'),
      autoScore: new Prisma.Decimal(data.autoScore),
      finalScore: data.finalScore === null ? null : new Prisma.Decimal(data.finalScore),
      essayAnswers
    }

    return Promise.resolve({
      didFinalize: true,
      submission: this.storedSubmission
    })
  }
}

class InMemoryNotificationRepository implements NotificationRepositoryPort {
  readonly created: NewNotification[] = []

  listForUser(): ReturnType<NotificationRepositoryPort['listForUser']> {
    return Promise.resolve([[], 0])
  }

  countUnread() {
    return Promise.resolve(0)
  }

  markRead() {
    return Promise.resolve(false)
  }

  markAllRead() {
    return Promise.resolve(0)
  }

  createMany(notifications: NewNotification[]) {
    this.created.push(...notifications)
    return Promise.resolve(notifications.length)
  }

  listCourseStudentIds() {
    return Promise.resolve([])
  }

  findAssessmentNotificationContext() {
    return Promise.resolve({ graderIds: ['teacher-1'], courseTitle: 'Toán 12' })
  }
}

test('turns a late objective submit into an auto-submitted graded result', async () => {
  const submission = createExpiredSubmission(AssessmentItemType.mcq)
  const repository = new InMemoryStudentAssessmentRepository(submission)
  const notificationRepository = new InMemoryNotificationRepository()
  const service = new StudentAssessmentService(
    repository,
    new NotificationEventService(notificationRepository)
  )

  const result = await service.submitAttempt({
    userId: submission.studentId,
    submissionId: submission.id
  })

  assert.equal(repository.lastFinalize?.status, SubmissionStatus.auto_submitted)
  assert.equal(repository.lastFinalize?.finalScore, '1')
  assert.equal(result.status, SubmissionStatus.auto_submitted)
  assert.equal(notificationRepository.created[0].type, NotificationType.graded)
})

test('creates a blank essay answer when an expired attempt never saved that answer', async () => {
  const submission = createExpiredSubmission(AssessmentItemType.essay)
  const repository = new InMemoryStudentAssessmentRepository(submission)
  const notificationRepository = new InMemoryNotificationRepository()
  const service = new StudentAssessmentService(
    repository,
    new NotificationEventService(notificationRepository)
  )

  const result = await service.autoSubmitExpiredAttempts({
    now: new Date('2026-06-01T09:00:00.000Z'),
    limit: 100
  })

  assert.deepEqual(repository.lastFinalize?.essayItemIds, [itemId])
  assert.equal(repository.lastFinalize?.finalScore, null)
  assert.equal(result.submittedCount, 1)
  assert.equal(notificationRepository.created[0].type, NotificationType.essay_submission)
})

test('auto-submits an active attempt when the server records the fifth violation', async () => {
  const submission = createExpiredSubmission(AssessmentItemType.mcq)
  submission.startTime = new Date('2099-06-01T09:30:00.000Z')
  if (submission.placement) {
    submission.placement.closeTime = new Date('2099-06-01T10:00:00.000Z')
  }
  const repository = new InMemoryStudentAssessmentRepository(submission)
  const notificationRepository = new InMemoryNotificationRepository()
  const service = new StudentAssessmentService(
    repository,
    new NotificationEventService(notificationRepository)
  )

  for (let count = 1; count <= 4; count += 1) {
    const result = await service.recordViolation({
      userId: submission.studentId,
      submissionId: submission.id
    })
    assert.equal(result.violationCount, count)
    assert.equal(result.autoSubmitted, false)
  }

  const result = await service.recordViolation({
    userId: submission.studentId,
    submissionId: submission.id
  })

  assert.equal(result.violationCount, 5)
  assert.equal(result.autoSubmitted, true)
  assert.equal(repository.lastFinalize?.status, SubmissionStatus.auto_submitted)
})
