import type { SubmissionStatus, UserStatus } from '@prisma/client'

import type { AssessmentParticipantStatus } from '../helpers/assessment-results.helper'

export type AssessmentResultStudentDto = {
  id: string
  fullName: string
  email: string
  avatarMediaId: string | null
  avatarUrl: string | null
  status: UserStatus
}

export type AssessmentResultAttemptDto = {
  id: string
  attemptNumber: number
  status: SubmissionStatus
  startTime: Date
  submitTime: Date | null
  updatedAt: Date
  autoScore: string | null
  finalScore: string | null
  violationCount: number
}

export type AssessmentResultParticipantDto = {
  student: AssessmentResultStudentDto
  status: AssessmentParticipantStatus
  attemptCount: number
  bestScore: string | null
  latestScore: string | null
  latestSubmissionId: string | null
  latestSubmissionStatus: SubmissionStatus | null
  latestSubmitTime: Date | null
  latestActivityAt: Date | null
}
