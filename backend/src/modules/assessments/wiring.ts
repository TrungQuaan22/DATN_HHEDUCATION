import {
  adminAssessmentRepository,
  publicAssessmentRepository,
  studentAssessmentRepository
} from './repositories'
import { AdminAssessmentService } from './services/admin.service'
import { PublicAssessmentService } from './services/public.service'
import { StudentAssessmentService } from './services/student.service'

export const adminAssessmentService = new AdminAssessmentService(adminAssessmentRepository)

export const publicAssessmentService = new PublicAssessmentService(
  publicAssessmentRepository,
  studentAssessmentRepository
)

export const studentAssessmentService = new StudentAssessmentService(studentAssessmentRepository)
