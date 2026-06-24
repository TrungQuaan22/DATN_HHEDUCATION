import type { CourseStatus, EnrollmentSource, UserRole, UserStatus } from '@prisma/client'

export type ManualEnrollmentCourseRecord = {
  id: string
  title: string
  slug: string
  status: CourseStatus
  price: number
  salePrice: number | null
  teacherId: string
  deletedAt: Date | null
}

export type ManualEnrollmentUserRecord = {
  id: string
  role: UserRole
  status: UserStatus
}

export type ManualEnrollmentRecord = {
  id: string
  courseId: string
  userId: string
  source: EnrollmentSource
  orderId: string | null
  manualReason: string | null
  enrolledAt: Date
}

export interface EnrollmentRepositoryPort {
  findCourseForManualEnrollment(courseId: string): Promise<ManualEnrollmentCourseRecord | null>
  findUserForManualEnrollment(userId: string): Promise<ManualEnrollmentUserRecord | null>
  findEnrollmentByUserAndCourse(data: {
    userId: string
    courseId: string
  }): Promise<{ id: string } | null>
  createManualEnrollment(data: {
    userId: string
    courseId: string
    manualReason?: string
  }): Promise<ManualEnrollmentRecord>
  isUniqueConstraintError(error: unknown): boolean
}
