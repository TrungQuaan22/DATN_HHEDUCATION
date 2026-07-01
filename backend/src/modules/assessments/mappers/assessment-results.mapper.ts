import { mapMediaUrl } from '~/common/mappers/media.mapper'

import type { AssessmentResultParticipantDto } from '../dto'
import {
  getBestFinalScore,
  getLatestScore,
  getParticipantStatus
} from '../helpers/assessment-results.helper'
import type { AssessmentResultParticipantRecord } from '../ports/admin-assessment-result-repository.port'

export function mapAssessmentResultParticipant(
  participant: AssessmentResultParticipantRecord
): AssessmentResultParticipantDto {
  const latestAttempt = participant.attempts.at(-1) ?? null

  return {
    student: {
      id: participant.student.id,
      fullName: participant.student.fullName,
      email: participant.student.email,
      avatarMediaId: participant.student.avatarMediaId,
      avatarUrl: mapMediaUrl(participant.student.avatarObjectKey),
      status: participant.student.status
    },
    status: getParticipantStatus(participant),
    attemptCount: participant.attempts.length,
    bestScore: getBestFinalScore(participant),
    latestScore: getLatestScore(participant),
    latestSubmissionId: latestAttempt?.id ?? null,
    latestSubmissionStatus: latestAttempt?.status ?? null,
    latestSubmitTime: latestAttempt?.submitTime ?? null,
    latestActivityAt: latestAttempt?.updatedAt ?? null
  }
}
