import { UserRole, type Prisma } from '@prisma/client'

import { prisma } from '~/config/db'

import type {
  AdminAssessmentResultRepositoryPort,
  AssessmentResultAttemptRecord,
  AssessmentResultContextRecord,
  AssessmentResultParticipantRecord
} from '../ports/admin-assessment-result-repository.port'

const RESULT_CONTEXT_INCLUDE = {
  items: {
    select: { maxScore: true }
  },
  placements: {
    take: 1,
    include: {
      course: {
        select: {
          id: true,
          title: true,
          teacherId: true
        }
      },
      lesson: {
        select: {
          id: true,
          title: true,
          chapter: {
            select: {
              course: {
                select: {
                  id: true,
                  title: true,
                  teacherId: true
                }
              }
            }
          }
        }
      }
    }
  }
} satisfies Prisma.AssessmentInclude

type PrismaResultContext = Prisma.AssessmentGetPayload<{
  include: typeof RESULT_CONTEXT_INCLUDE
}>

const PARTICIPANT_SUBMISSION_SELECT = {
  id: true,
  attemptNumber: true,
  status: true,
  startTime: true,
  submitTime: true,
  updatedAt: true,
  autoScore: true,
  finalScore: true,
  violationCount: true
} satisfies Prisma.SubmissionSelect

const PARTICIPANT_USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  avatarMediaId: true,
  avatarObjectKey: true,
  status: true
} satisfies Prisma.UserSelect

type PrismaParticipantUser = Prisma.UserGetPayload<{
  select: typeof PARTICIPANT_USER_SELECT
}>

type PrismaParticipantAttempt = Prisma.SubmissionGetPayload<{
  select: typeof PARTICIPANT_SUBMISSION_SELECT
}>

// Map một lần làm bài sang record kết quả.
function mapAttempt(attempt: PrismaParticipantAttempt): AssessmentResultAttemptRecord {
  return {
    ...attempt,
    autoScore: attempt.autoScore?.toString() ?? null,
    finalScore: attempt.finalScore?.toString() ?? null
  }
}

// Map học sinh và các lần làm sang participant result.
function mapParticipant(
  student: PrismaParticipantUser,
  attempts: PrismaParticipantAttempt[]
): AssessmentResultParticipantRecord {
  return {
    student,
    attempts: attempts.map(mapAttempt)
  }
}

// Tạo điều kiện tìm kiếm học sinh theo tên hoặc email.
function buildStudentSearch(search?: string): Prisma.UserWhereInput {
  if (!search) return {}

  return {
    OR: [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ]
  }
}

// Map assessment và placement thành context xem kết quả.
function mapContext(assessment: PrismaResultContext): AssessmentResultContextRecord {
  const placement = assessment.placements[0] ?? null
  const maxScore = assessment.items.reduce((total, item) => total + Number(item.maxScore), 0)

  return {
    id: assessment.id,
    title: assessment.title,
    subject: assessment.subject,
    grade: assessment.grade,
    type: assessment.type,
    gradingType: assessment.gradingType,
    visibility: assessment.visibility,
    timeLimitMinutes: assessment.timeLimitMinutes,
    createdById: assessment.createdById,
    maxScore: maxScore.toString(),
    placement: placement
      ? {
          id: placement.id,
          type: placement.type,
          courseId: placement.courseId,
          lessonId: placement.lessonId,
          openTime: placement.openTime,
          closeTime: placement.closeTime,
          maxAttempts: placement.maxAttempts,
          course: placement.course,
          lesson: placement.lesson
        }
      : null
  }
}

export class PrismaAdminAssessmentResultRepository implements AdminAssessmentResultRepositoryPort {
  // Lấy context assessment để kiểm tra quyền xem kết quả.
  async findResultContext(assessmentId: string) {
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        deletedAt: null
      },
      include: RESULT_CONTEXT_INCLUDE
    })

    return assessment ? mapContext(assessment) : null
  }

  // Liệt kê học sinh liên quan tới assessment và các attempt của họ.
  async listParticipants(data: { assessmentId: string; courseId: string | null; search?: string }) {
    if (data.courseId) {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId: data.courseId,
          user: {
            role: UserRole.student,
            deletedAt: null,
            ...buildStudentSearch(data.search)
          }
        },
        orderBy: [{ user: { fullName: 'asc' } }, { id: 'asc' }],
        include: {
          user: {
            select: {
              ...PARTICIPANT_USER_SELECT,
              submissions: {
                where: { assessmentId: data.assessmentId },
                orderBy: { attemptNumber: 'asc' },
                select: PARTICIPANT_SUBMISSION_SELECT
              }
            }
          }
        }
      })

      return enrollments.map((enrollment) =>
        mapParticipant(enrollment.user, enrollment.user.submissions)
      )
    }

    const students = await prisma.user.findMany({
      where: {
        role: UserRole.student,
        deletedAt: null,
        submissions: { some: { assessmentId: data.assessmentId } },
        ...buildStudentSearch(data.search)
      },
      orderBy: [{ fullName: 'asc' }, { id: 'asc' }],
      select: {
        ...PARTICIPANT_USER_SELECT,
        submissions: {
          where: { assessmentId: data.assessmentId },
          orderBy: { attemptNumber: 'asc' },
          select: PARTICIPANT_SUBMISSION_SELECT
        }
      }
    })

    return students.map((student) => mapParticipant(student, student.submissions))
  }

  // Lấy một học sinh cụ thể cùng các attempt trong assessment.
  async findParticipant(data: {
    assessmentId: string
    courseId: string | null
    studentId: string
  }) {
    if (data.courseId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: data.studentId,
            courseId: data.courseId
          }
        },
        include: {
          user: {
            select: {
              ...PARTICIPANT_USER_SELECT,
              submissions: {
                where: { assessmentId: data.assessmentId },
                orderBy: { attemptNumber: 'asc' },
                select: PARTICIPANT_SUBMISSION_SELECT
              }
            }
          }
        }
      })

      return enrollment ? mapParticipant(enrollment.user, enrollment.user.submissions) : null
    }

    const student = await prisma.user.findFirst({
      where: {
        id: data.studentId,
        role: UserRole.student,
        deletedAt: null,
        submissions: { some: { assessmentId: data.assessmentId } }
      },
      select: {
        ...PARTICIPANT_USER_SELECT,
        submissions: {
          where: { assessmentId: data.assessmentId },
          orderBy: { attemptNumber: 'asc' },
          select: PARTICIPANT_SUBMISSION_SELECT
        }
      }
    })

    return student ? mapParticipant(student, student.submissions) : null
  }
}
