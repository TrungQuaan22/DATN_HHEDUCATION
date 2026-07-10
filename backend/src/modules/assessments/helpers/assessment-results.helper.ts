import type { AssessmentResultParticipantRecord } from '../ports/admin-assessment-result-repository.port'

export type AssessmentParticipantStatus = 'not_started' | 'doing' | 'pending_grading' | 'completed'

// Xác định trạng thái tổng hợp của một học sinh trong bài assessment.
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

// Lấy điểm cuối cùng tốt nhất trong các lần làm của học sinh.
export function getBestFinalScore(participant: AssessmentResultParticipantRecord): string | null {
  const scores = participant.attempts
    .map((attempt) => attempt.finalScore)
    .filter((score): score is string => score !== null)

  if (scores.length === 0) return null
  return Math.max(...scores.map(Number)).toString()
}

// Lấy điểm của lần làm mới nhất.
export function getLatestScore(participant: AssessmentResultParticipantRecord): string | null {
  const latestAttempt = participant.attempts.at(-1)
  return latestAttempt?.finalScore ?? latestAttempt?.autoScore ?? null
}
