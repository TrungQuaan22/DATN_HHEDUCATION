import {
  adminAssessmentRepository,
  adminAssessmentResultRepository,
  publicAssessmentRepository,
  studentAssessmentRepository
} from './repositories'
import { AdminAssessmentService } from './services/admin.service'
import { PublicAssessmentService } from './services/public.service'
import { StudentAssessmentService } from './services/student.service'
import { AdminAssessmentResultService } from './services/admin-results.service'
import { notificationEventService } from '~/modules/notifications/service'

export const adminAssessmentService = new AdminAssessmentService(
  adminAssessmentRepository,
  notificationEventService
)

export const publicAssessmentService = new PublicAssessmentService(
  publicAssessmentRepository,
  studentAssessmentRepository
)

export const studentAssessmentService = new StudentAssessmentService(
  studentAssessmentRepository,
  notificationEventService
)
export const adminAssessmentResultService = new AdminAssessmentResultService(
  adminAssessmentResultRepository
)
