import type { AssessmentResultParticipantRecord } from '../ports/admin-assessment-result-repository.port'

export type AssessmentParticipantStatus = 'not_started' | 'doing' | 'pending_grading' | 'completed'

export function getParticipantStatus(
  participant: AssessmentResultParticipantRecord
): AssessmentParticipantStatus {
  const latestAttempt = participant.attempts.at(-1)

  if (!latestAttempt) return 'not_started'
  if (latestAttempt.status === 'doing') return 'doing'
  if (
    latestAttempt.status === 'submitted' ||
    (latestAttempt.status === 'auto_submitted' && latestAttempt.finalScore === null)
  ) {
    return 'pending_grading'
  }
  return 'completed'
}

export function getBestFinalScore(participant: AssessmentResultParticipantRecord): string | null {
  const scores = participant.attempts
    .map((attempt) => attempt.finalScore)
    .filter((score): score is string => score !== null)

  if (scores.length === 0) return null
  return Math.max(...scores.map(Number)).toString()
}

export function getLatestScore(participant: AssessmentResultParticipantRecord): string | null {
  const latestAttempt = participant.attempts.at(-1)
  return latestAttempt?.finalScore ?? latestAttempt?.autoScore ?? null
}
