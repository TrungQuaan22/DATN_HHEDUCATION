import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getSubmissionDeadlineAt,
  getTimeRemainingSeconds,
  isSubmissionExpired
} from './submission-deadline.policy'

const startTime = new Date('2026-06-01T08:00:00.000Z')

test('uses the individual time limit when it expires before placement close time', () => {
  const deadline = getSubmissionDeadlineAt({
    startTime,
    timeLimitMinutes: 45,
    closeTime: new Date('2026-06-01T10:00:00.000Z')
  })

  assert.equal(deadline?.toISOString(), '2026-06-01T08:45:00.000Z')
})

test('uses placement close time when it arrives before the individual time limit', () => {
  const deadline = getSubmissionDeadlineAt({
    startTime,
    timeLimitMinutes: 120,
    closeTime: new Date('2026-06-01T08:30:00.000Z')
  })

  assert.equal(deadline?.toISOString(), '2026-06-01T08:30:00.000Z')
  assert.equal(
    isSubmissionExpired(
      {
        startTime,
        timeLimitMinutes: 120,
        closeTime: new Date('2026-06-01T08:30:00.000Z')
      },
      new Date('2026-06-01T08:30:00.000Z')
    ),
    true
  )
})

test('returns no deadline for an untimed placement', () => {
  const input = { startTime, timeLimitMinutes: null, closeTime: null }

  assert.equal(getSubmissionDeadlineAt(input), null)
  assert.equal(getTimeRemainingSeconds(input), null)
  assert.equal(isSubmissionExpired(input), false)
})
