import { UserRole, type Prisma } from '@prisma/client'

import { prisma } from '~/config/db'

import type {
  AdminCourseStudentProgressRecord,
  AdminCourseStudentRecord,
  AdminCourseStudentRepositoryPort,
  CourseStudentProgressCounts,
  CourseStudentProgressStatus,
  ListCourseStudentsFilters
} from '../ports/admin-course-student-repository.port'

const ASSESSMENT_ATTEMPT_SELECT = {
  id: true,
  assessmentId: true,
  attemptNumber: true,
  status: true,
  submitTime: true,
  updatedAt: true,
  autoScore: true,
  finalScore: true
} satisfies Prisma.SubmissionSelect

const buildStudentInclude = (courseId: string, assessmentIds: string[]) =>
  ({
    user: {
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarMediaId: true,
        avatarObjectKey: true,
        status: true,
        courseProgress: {
          where: { courseId },
          select: {
            completedLessons: true,
            lastLearnedAt: true
          }
        },
        submissions: {
          where: { assessmentId: { in: assessmentIds } },
          orderBy: [{ assessmentId: 'asc' }, { attemptNumber: 'asc' }],
          select: ASSESSMENT_ATTEMPT_SELECT
        }
      }
    }
  }) satisfies Prisma.EnrollmentInclude

type PrismaCourseStudent = Prisma.EnrollmentGetPayload<{
  include: ReturnType<typeof buildStudentInclude>
}>

const COURSE_ASSESSMENT_INCLUDE = {
  items: { select: { maxScore: true } },
  placements: {
    take: 1,
    select: {
      maxAttempts: true,
      openTime: true,
      closeTime: true
    }
  }
} satisfies Prisma.AssessmentInclude

type PrismaCourseAssessment = Prisma.AssessmentGetPayload<{
  include: typeof COURSE_ASSESSMENT_INCLUDE
}>

async function findCourseAssessments(courseId: string): Promise<PrismaCourseAssessment[]> {
  return prisma.assessment.findMany({
    where: {
      deletedAt: null,
      visibility: 'published',
      placements: {
        some: {
          OR: [{ courseId }, { lesson: { chapter: { courseId } } }]
        }
      }
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    include: COURSE_ASSESSMENT_INCLUDE
  })
}

function mapAttempt(attempt: {
  id: string
  assessmentId: string
  attemptNumber: number
  status: import('@prisma/client').SubmissionStatus
  submitTime: Date | null
  updatedAt: Date
  autoScore: import('@prisma/client').Prisma.Decimal | null
  finalScore: import('@prisma/client').Prisma.Decimal | null
}) {
  return {
    ...attempt,
    autoScore: attempt.autoScore?.toString() ?? null,
    finalScore: attempt.finalScore?.toString() ?? null
  }
}

const buildStudentProgressInclude = (studentId: string) =>
  ({
    user: {
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarMediaId: true,
        avatarObjectKey: true,
        status: true
      }
    },
    course: {
      select: {
        id: true,
        title: true,
        totalLessons: true,
        courseProgress: {
          where: { userId: studentId },
          select: {
            completedLessons: true,
            lastLearnedAt: true
          }
        },
        chapters: {
          where: { deletedAt: null },
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            title: true,
            orderIndex: true,
            lessons: {
              where: { deletedAt: null },
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                title: true,
                type: true,
                orderIndex: true,
                progress: {
                  where: { userId: studentId },
                  select: {
                    watchedSeconds: true,
                    lastPositionSec: true,
                    durationSec: true,
                    isCompleted: true,
                    completedAt: true,
                    updatedAt: true
                  }
                },
                assessmentPlacements: {
                  where: { type: 'lesson' },
                  take: 1,
                  select: {
                    submissions: {
                      where: { studentId },
                      orderBy: { attemptNumber: 'desc' },
                      take: 1,
                      select: {
                        status: true,
                        submitTime: true,
                        updatedAt: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }) satisfies Prisma.EnrollmentInclude

type PrismaCourseStudentProgress = Prisma.EnrollmentGetPayload<{
  include: ReturnType<typeof buildStudentProgressInclude>
}>

function buildProgressWhere(
  courseId: string,
  totalLessons: number,
  status: CourseStudentProgressStatus
): Prisma.EnrollmentWhereInput {
  if (totalLessons === 0 && status !== 'not_started') {
    return { id: { in: [] } }
  }

  if (status === 'not_started') {
    return {
      OR: [
        { user: { courseProgress: { none: { courseId } } } },
        { user: { courseProgress: { some: { courseId, completedLessons: 0 } } } }
      ]
    }
  }

  if (status === 'completed') {
    return {
      user: {
        courseProgress: {
          some: { courseId, completedLessons: { gte: totalLessons } }
        }
      }
    }
  }

  return {
    user: {
      courseProgress: {
        some: {
          courseId,
          completedLessons: { gt: 0, lt: totalLessons }
        }
      }
    }
  }
}

function buildCourseStudentsWhere(data: {
  courseId: string
  totalLessons: number
  filters?: ListCourseStudentsFilters
}): Prisma.EnrollmentWhereInput {
  const and: Prisma.EnrollmentWhereInput[] = []

  if (data.filters?.search) {
    and.push({
      user: {
        OR: [
          { fullName: { contains: data.filters.search, mode: 'insensitive' } },
          { email: { contains: data.filters.search, mode: 'insensitive' } }
        ]
      }
    })
  }

  if (data.filters?.progressStatus) {
    and.push(buildProgressWhere(data.courseId, data.totalLessons, data.filters.progressStatus))
  }

  return {
    courseId: data.courseId,
    user: {
      role: UserRole.student,
      deletedAt: null
    },
    AND: and.length > 0 ? and : undefined
  }
}

function mapStudentRecord(enrollment: PrismaCourseStudent): AdminCourseStudentRecord {
  return {
    student: {
      id: enrollment.user.id,
      fullName: enrollment.user.fullName,
      email: enrollment.user.email,
      avatarMediaId: enrollment.user.avatarMediaId,
      avatarObjectKey: enrollment.user.avatarObjectKey,
      status: enrollment.user.status
    },
    source: enrollment.source,
    enrolledAt: enrollment.enrolledAt,
    progress: enrollment.user.courseProgress[0] ?? null,
    assessmentSubmissions: enrollment.user.submissions.map(mapAttempt)
  }
}

function mapStudentProgressRecord(
  enrollment: PrismaCourseStudentProgress,
  assessments: PrismaCourseAssessment[],
  attempts: Awaited<ReturnType<typeof prisma.submission.findMany>>
): AdminCourseStudentProgressRecord {
  return {
    student: enrollment.user,
    source: enrollment.source,
    enrolledAt: enrollment.enrolledAt,
    courseProgress: enrollment.course.courseProgress[0] ?? null,
    assessments: assessments.map((assessment) => ({
      id: assessment.id,
      title: assessment.title,
      maxScore: assessment.items
        .reduce((total, item) => total + Number(item.maxScore), 0)
        .toString(),
      maxAttempts: assessment.placements[0]?.maxAttempts ?? null,
      openTime: assessment.placements[0]?.openTime ?? null,
      closeTime: assessment.placements[0]?.closeTime ?? null,
      attempts: attempts.filter((attempt) => attempt.assessmentId === assessment.id).map(mapAttempt)
    })),
    course: {
      id: enrollment.course.id,
      title: enrollment.course.title,
      totalLessons: enrollment.course.totalLessons,
      chapters: enrollment.course.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        orderIndex: chapter.orderIndex,
        lessons: chapter.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          orderIndex: lesson.orderIndex,
          progress: lesson.progress[0] ?? null,
          assessmentSubmission: lesson.assessmentPlacements[0]?.submissions[0] ?? null
        }))
      }))
    }
  }
}

export class PrismaAdminCourseStudentRepository implements AdminCourseStudentRepositoryPort {
  async listCourseStudents(data: {
    courseId: string
    totalLessons: number
    filters: ListCourseStudentsFilters
    page: number
    limit: number
  }) {
    const assessments = await findCourseAssessments(data.courseId)
    const assessmentIds = assessments.map((assessment) => assessment.id)
    const where = buildCourseStudentsWhere(data)
    const baseWhere = buildCourseStudentsWhere({
      courseId: data.courseId,
      totalLessons: data.totalLessons
    })
    const notStartedWhere = {
      ...baseWhere,
      AND: [buildProgressWhere(data.courseId, data.totalLessons, 'not_started')]
    } satisfies Prisma.EnrollmentWhereInput
    const inProgressWhere = {
      ...baseWhere,
      AND: [buildProgressWhere(data.courseId, data.totalLessons, 'in_progress')]
    } satisfies Prisma.EnrollmentWhereInput
    const completedWhere = {
      ...baseWhere,
      AND: [buildProgressWhere(data.courseId, data.totalLessons, 'completed')]
    } satisfies Prisma.EnrollmentWhereInput

    const [items, totalItems, total, notStarted, inProgress, completed] = await prisma.$transaction(
      [
        prisma.enrollment.findMany({
          where,
          skip: (data.page - 1) * data.limit,
          take: data.limit,
          orderBy: [{ enrolledAt: 'desc' }, { id: 'desc' }],
          include: buildStudentInclude(data.courseId, assessmentIds)
        }),
        prisma.enrollment.count({ where }),
        prisma.enrollment.count({ where: baseWhere }),
        prisma.enrollment.count({ where: notStartedWhere }),
        data.totalLessons > 0
          ? prisma.enrollment.count({ where: inProgressWhere })
          : prisma.enrollment.count({ where: { id: { in: [] } } }),
        data.totalLessons > 0
          ? prisma.enrollment.count({ where: completedWhere })
          : prisma.enrollment.count({ where: { id: { in: [] } } })
      ]
    )

    const counts: CourseStudentProgressCounts = {
      total,
      notStarted,
      inProgress,
      completed
    }

    return {
      items: items.map(mapStudentRecord),
      totalItems,
      counts,
      totalAssessments: assessments.length
    }
  }

  async findStudentProgress(courseId: string, studentId: string) {
    const assessments = await findCourseAssessments(courseId)
    const [enrollment, attempts] = await Promise.all([
      prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: studentId,
            courseId
          }
        },
        include: buildStudentProgressInclude(studentId)
      }),
      prisma.submission.findMany({
        where: {
          studentId,
          assessmentId: { in: assessments.map((assessment) => assessment.id) }
        },
        orderBy: [{ assessmentId: 'asc' }, { attemptNumber: 'asc' }]
      })
    ])

    return enrollment ? mapStudentProgressRecord(enrollment, assessments, attempts) : null
  }
}

export const adminCourseStudentRepository = new PrismaAdminCourseStudentRepository()
