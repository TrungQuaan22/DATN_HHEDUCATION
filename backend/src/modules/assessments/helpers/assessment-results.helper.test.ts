import assert from 'node:assert/strict'
import test from 'node:test'
import { SubmissionStatus, UserStatus } from '@prisma/client'

import type { AssessmentResultParticipantRecord } from '../ports/admin-assessment-result-repository.port'
import {
  getBestFinalScore,
  getLatestScore,
  getParticipantStatus
} from './assessment-results.helper'

const participant = (
  attempts: AssessmentResultParticipantRecord['attempts']
): AssessmentResultParticipantRecord => ({
  student: {
    id: '00000000-0000-0000-0000-000000000001',
    fullName: 'Nguyễn Văn An',
    email: 'an@example.com',
    avatarMediaId: null,
    avatarObjectKey: null,
    status: UserStatus.active
  },
  attempts
})

const attempt = (
  attemptNumber: number,
  status: SubmissionStatus,
  finalScore: string | null,
  autoScore: string | null = null
) => ({
  id: `00000000-0000-0000-0000-${attemptNumber.toString().padStart(12, '0')}`,
  attemptNumber,
  status,
  startTime: new Date('2026-06-01T00:00:00.000Z'),
  submitTime: new Date('2026-06-01T01:00:00.000Z'),
  updatedAt: new Date(`2026-06-0${attemptNumber}T01:00:00.000Z`),
  autoScore,
  finalScore,
  violationCount: 0
})

test('treats a roster member without submissions as not started', () => {
  assert.equal(getParticipantStatus(participant([])), 'not_started')
})

test('uses the latest attempt for status and latest score', () => {
  const record = participant([
    attempt(1, SubmissionStatus.completed, '8'),
    attempt(2, SubmissionStatus.submitted, null, '6')
  ])

  assert.equal(getParticipantStatus(record), 'pending_grading')
  assert.equal(getLatestScore(record), '6')
})

test('uses the highest finalized score across attempts', () => {
  const record = participant([
    attempt(1, SubmissionStatus.completed, '7.5'),
    attempt(2, SubmissionStatus.completed, '9'),
    attempt(3, SubmissionStatus.doing, null)
  ])

  assert.equal(getBestFinalScore(record), '9')
})

test('treats an auto-submitted essay attempt without a final score as pending grading', () => {
  const record = participant([attempt(1, SubmissionStatus.auto_submitted, null, '4')])

  assert.equal(getParticipantStatus(record), 'pending_grading')
})
