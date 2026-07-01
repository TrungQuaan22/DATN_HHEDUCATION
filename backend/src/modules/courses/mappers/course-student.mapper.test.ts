import assert from 'node:assert/strict'
import test from 'node:test'
import { EnrollmentSource, LessonType, SubmissionStatus, UserStatus } from '@prisma/client'

import type {
  AdminCourseStudentProgressRecord,
  AdminCourseStudentRecord
} from '../ports/admin-course-student-repository.port'
import {
  mapAdminCourseStudentProgressResponse,
  mapAdminCourseStudentResponse
} from './course-student.mapper'

const student = {
  id: '00000000-0000-0000-0000-000000000001',
  fullName: 'Nguyễn Văn An',
  email: 'an@example.com',
  avatarMediaId: null,
  avatarObjectKey: null,
  status: UserStatus.active
}

test('maps a course student summary to an in-progress status', () => {
  const record: AdminCourseStudentRecord = {
    student,
    source: EnrollmentSource.payment,
    enrolledAt: new Date('2026-06-01T00:00:00.000Z'),
    progress: {
      completedLessons: 2,
      lastLearnedAt: new Date('2026-06-20T00:00:00.000Z')
    },
    assessmentSubmissions: []
  }

  const result = mapAdminCourseStudentResponse(record, 5, 0)

  assert.equal(result.progressStatus, 'in_progress')
  assert.equal(result.progressPercentage, 40)
  assert.equal(result.completedLessons, 2)
})

test('summarizes assessment submissions from each latest attempt', () => {
  const record: AdminCourseStudentRecord = {
    student,
    source: EnrollmentSource.payment,
    enrolledAt: new Date('2026-06-01T00:00:00.000Z'),
    progress: null,
    assessmentSubmissions: [
      {
        id: '00000000-0000-0000-0000-000000000011',
        assessmentId: '00000000-0000-0000-0000-000000000021',
        attemptNumber: 1,
        status: SubmissionStatus.submitted,
        submitTime: new Date('2026-06-20T00:00:00.000Z'),
        updatedAt: new Date('2026-06-20T00:00:00.000Z'),
        autoScore: '6',
        finalScore: null
      },
      {
        id: '00000000-0000-0000-0000-000000000012',
        assessmentId: '00000000-0000-0000-0000-000000000021',
        attemptNumber: 2,
        status: SubmissionStatus.completed,
        submitTime: new Date('2026-06-22T00:00:00.000Z'),
        updatedAt: new Date('2026-06-22T00:00:00.000Z'),
        autoScore: '7',
        finalScore: '8'
      }
    ]
  }

  const result = mapAdminCourseStudentResponse(record, 5, 2)

  assert.equal(result.assessmentProgress.completedAssessments, 1)
  assert.equal(result.assessmentProgress.pendingGradingAssessments, 0)
  assert.equal(result.assessmentProgress.notStartedAssessments, 1)
  assert.equal(result.assessmentProgress.bestScore, '8')
  assert.equal(result.assessmentProgress.latestScore, '8')
})

test('maps video and quiz activity into curriculum progress', () => {
  const record: AdminCourseStudentProgressRecord = {
    student,
    source: EnrollmentSource.payment,
    enrolledAt: new Date('2026-06-01T00:00:00.000Z'),
    courseProgress: {
      completedLessons: 1,
      lastLearnedAt: new Date('2026-06-22T00:00:00.000Z')
    },
    assessments: [],
    course: {
      id: '00000000-0000-0000-0000-000000000002',
      title: 'Toán 12',
      totalLessons: 2,
      chapters: [
        {
          id: '00000000-0000-0000-0000-000000000003',
          title: 'Chương 1',
          orderIndex: 1,
          lessons: [
            {
              id: '00000000-0000-0000-0000-000000000004',
              title: 'Video bài giảng',
              type: LessonType.video,
              orderIndex: 1,
              progress: {
                watchedSeconds: 90,
                lastPositionSec: 90,
                durationSec: 100,
                isCompleted: true,
                completedAt: new Date('2026-06-20T00:00:00.000Z'),
                updatedAt: new Date('2026-06-20T00:00:00.000Z')
              },
              assessmentSubmission: null
            },
            {
              id: '00000000-0000-0000-0000-000000000005',
              title: 'Quiz cuối chương',
              type: LessonType.quiz,
              orderIndex: 2,
              progress: null,
              assessmentSubmission: {
                status: SubmissionStatus.completed,
                submitTime: new Date('2026-06-22T00:00:00.000Z'),
                updatedAt: new Date('2026-06-22T00:00:00.000Z')
              }
            }
          ]
        }
      ]
    }
  }

  const result = mapAdminCourseStudentProgressResponse(record)

  assert.equal(result.summary.completedLessons, 2)
  assert.equal(result.summary.progressPercentage, 100)
  assert.equal(result.summary.progressStatus, 'completed')
  assert.deepEqual(
    result.chapters[0].lessons.map((lesson) => lesson.status),
    ['completed', 'completed']
  )
})
