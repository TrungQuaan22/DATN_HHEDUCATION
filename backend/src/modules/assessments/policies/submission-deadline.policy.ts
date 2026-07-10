export type SubmissionDeadlineInput = {
  startTime: Date
  timeLimitMinutes: number | null
  closeTime: Date | null
}

// Lấy hạn nộp thực tế: thời lượng làm bài hoặc closeTime, mốc nào sớm hơn.
export function getSubmissionDeadlineAt(data: SubmissionDeadlineInput): Date | null {
  const deadlines: number[] = []

  if (data.timeLimitMinutes !== null) {
    deadlines.push(data.startTime.getTime() + data.timeLimitMinutes * 60 * 1000)
  }

  if (data.closeTime) {
    deadlines.push(data.closeTime.getTime())
  }

  return deadlines.length > 0 ? new Date(Math.min(...deadlines)) : null
}

// Tính số giây còn lại trước hạn nộp bài.
export function getTimeRemainingSeconds(
  data: SubmissionDeadlineInput,
  now = new Date()
): number | null {
  const deadlineAt = getSubmissionDeadlineAt(data)
  if (!deadlineAt) return null

  return Math.max(0, Math.floor((deadlineAt.getTime() - now.getTime()) / 1000))
}

// Kiểm tra submission đã quá hạn nộp chưa.
export function isSubmissionExpired(data: SubmissionDeadlineInput, now = new Date()): boolean {
  const deadlineAt = getSubmissionDeadlineAt(data)
  return deadlineAt !== null && deadlineAt.getTime() <= now.getTime()
}
