import type { ManualEnrollmentResponse } from '../dto'
import type { ManualEnrollmentRecord } from '../ports/enrollment-repository.port'

export function mapEnrollment(enrollment: ManualEnrollmentRecord): ManualEnrollmentResponse {
  return {
    id: enrollment.id,
    courseId: enrollment.courseId,
    userId: enrollment.userId,
    source: 'manual',
    orderId: null,
    manualReason: enrollment.manualReason,
    enrolledAt: enrollment.enrolledAt
  }
}
