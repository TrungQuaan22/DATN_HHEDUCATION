import type { StudentAssessmentService } from '../services/student.service'

const DEFAULT_INTERVAL_MS = 30_000
const DEFAULT_BATCH_SIZE = 100

const readPositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function startAssessmentDeadlineWorker(service: StudentAssessmentService) {
  const intervalMs = readPositiveInteger(
    process.env.ASSESSMENT_DEADLINE_SWEEP_INTERVAL_MS,
    DEFAULT_INTERVAL_MS
  )
  const batchSize = readPositiveInteger(
    process.env.ASSESSMENT_DEADLINE_SWEEP_BATCH_SIZE,
    DEFAULT_BATCH_SIZE
  )
  let isRunning = false

  const run = async () => {
    if (isRunning) return
    isRunning = true

    try {
      const totals = { candidateCount: 0, submittedCount: 0, failedCount: 0 }

      while (true) {
        const result = await service.autoSubmitExpiredAttempts({ limit: batchSize })
        totals.candidateCount += result.candidateCount
        totals.submittedCount += result.submittedCount
        totals.failedCount += result.failedCount

        if (result.candidateCount < batchSize || result.failedCount > 0) break
      }

      if (totals.submittedCount > 0 || totals.failedCount > 0) {
        console.info('[assessment-deadline] Sweep completed', totals)
      }
    } catch (error) {
      console.error('[assessment-deadline] Sweep failed', error)
    } finally {
      isRunning = false
    }
  }

  void run()
  const timer = setInterval(() => void run(), intervalMs)
  timer.unref()

  return () => clearInterval(timer)
}
