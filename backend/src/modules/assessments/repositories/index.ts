import { PrismaAdminAssessmentRepository } from './admin.repository'
import { PrismaStudentAssessmentRepository } from './student.repository'
import { PrismaPublicAssessmentRepository } from './public.repository'
import { PrismaAdminAssessmentResultRepository } from './admin-results.repository'

export const adminAssessmentRepository = new PrismaAdminAssessmentRepository()
export const studentAssessmentRepository = new PrismaStudentAssessmentRepository()
export const publicAssessmentRepository = new PrismaPublicAssessmentRepository()
export const adminAssessmentResultRepository = new PrismaAdminAssessmentResultRepository()
