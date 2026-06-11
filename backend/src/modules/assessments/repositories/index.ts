import { PrismaAdminAssessmentRepository } from './admin.repository'
import { PrismaStudentAssessmentRepository } from './student.repository'
import { PrismaPublicAssessmentRepository } from './public.repository'

export const adminAssessmentRepository = new PrismaAdminAssessmentRepository()
export const studentAssessmentRepository = new PrismaStudentAssessmentRepository()
export const publicAssessmentRepository = new PrismaPublicAssessmentRepository()
