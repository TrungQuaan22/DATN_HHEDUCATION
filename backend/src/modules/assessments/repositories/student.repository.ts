import {
  AssessmentItemType,
  AssessmentPlacementType,
  AssessmentVisibility,
  Enrollment,
  Prisma,
  Subject,
  SubmissionStatus
} from '@prisma/client'

import { prisma } from '~/config/db'

import type { SaveAnswerDto } from '../dto'
import type { StudentAssessmentRepositoryPort } from '../ports/student-assessment-repository.port'
import { runtimeAssessmentInclude, runtimeAssessmentPreviewInclude, answerInclude } from './shared'
import type {
  StudentPlacementListItem,
  RuntimePlacement,
  RuntimePreviewPlacement,
  SubmissionWorkspaceGate,
  SubmissionDetail,
  StudentSubmissionComplete
} from '../types'

export class PrismaStudentAssessmentRepository implements StudentAssessmentRepositoryPort {
  listStudentAssessmentPlacements(data: {
    userId: string
    subject?: Subject
    grade?: number
    status?: SubmissionStatus | 'not_started'
    page: number
    limit: number
  }): Promise<[StudentPlacementListItem[], number]> {
    const enrolledPlacementWhere: Prisma.AssessmentPlacementWhereInput = {
      OR: [
        {
          type: AssessmentPlacementType.course,
          course: {
            enrollments: {
              some: {
                userId: data.userId
              }
            }
          }
        },
        {
          type: AssessmentPlacementType.lesson,
          lesson: {
            chapter: {
              course: {
                enrollments: {
                  some: {
                    userId: data.userId
                  }
                }
              }
            }
          }
        }
      ]
    }

    const submissionStatusWhere: Prisma.AssessmentPlacementWhereInput =
      data.status === 'not_started'
        ? {
            submissions: {
              none: {
                studentId: data.userId
              }
            }
          }
        : data.status
          ? {
              submissions: {
                some: {
                  studentId: data.userId,
                  status: data.status
                }
              }
            }
          : {}

    const where: Prisma.AssessmentPlacementWhereInput = {
      assessment: {
        visibility: AssessmentVisibility.published,
        deletedAt: null,
        subject: data.subject,
        grade: data.grade
      },
      AND: [enrolledPlacementWhere, submissionStatusWhere]
    }

    return prisma.$transaction([
      prisma.assessmentPlacement.findMany({
        where,
        skip: (data.page - 1) * data.limit,
        take: data.limit,
        orderBy: [{ closeTime: 'asc' }, { createdAt: 'desc' }],
        include: {
          assessment: true,
          course: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          },
          lesson: {
            select: {
              id: true,
              title: true,
              chapter: {
                select: {
                  title: true,
                  course: {
                    select: {
                      id: true,
                      title: true,
                      slug: true
                    }
                  }
                }
              }
            }
          },
          submissions: {
            where: {
              studentId: data.userId
            },
            orderBy: {
              attemptNumber: 'desc'
            },
            select: {
              id: true,
              assessmentId: true,
              placementId: true,
              attemptNumber: true,
              status: true,
              startTime: true,
              submitTime: true,
              autoScore: true,
              finalScore: true
            }
          }
        }
      }),
      prisma.assessmentPlacement.count({ where })
    ])
  }

  findRuntimePlacementById(placementId: string): Promise<RuntimePlacement | null> {
    return prisma.assessmentPlacement.findFirst({
      where: {
        id: placementId,
        assessment: {
          visibility: AssessmentVisibility.published,
          deletedAt: null
        }
      },
      include: runtimeAssessmentInclude
    })
  }

  findRuntimePreviewPlacementById(placementId: string): Promise<RuntimePreviewPlacement | null> {
    return prisma.assessmentPlacement.findFirst({
      where: {
        id: placementId,
        assessment: {
          visibility: AssessmentVisibility.published,
          deletedAt: null
        }
      },
      include: runtimeAssessmentPreviewInclude
    })
  }

  findSubmissionWorkspaceGate(data: {
    submissionId: string
    userId: string
    placementId: string
  }): Promise<SubmissionWorkspaceGate | null> {
    return prisma.submission.findFirst({
      where: {
        id: data.submissionId,
        studentId: data.userId,
        placementId: data.placementId
      },
      select: {
        id: true,
        assessmentId: true,
        placementId: true,
        studentId: true,
        status: true,
        startTime: true,
        placement: {
          select: {
            id: true,
            type: true,
            openTime: true,
            closeTime: true,
            assessment: {
              select: {
                timeLimitMinutes: true,
                visibility: true,
                deletedAt: true
              }
            }
          }
        }
      }
    })
  }

  findEnrollmentForPlacement(userId: string, placementId: string): Promise<Enrollment | null> {
    return prisma.enrollment.findFirst({
      where: {
        userId,
        course: {
          assessmentPlacements: {
            some: {
              id: placementId
            }
          }
        }
      }
    })
  }

  findEnrollmentForLessonPlacement(
    userId: string,
    placementId: string
  ): Promise<Enrollment | null> {
    return prisma.enrollment.findFirst({
      where: {
        userId,
        course: {
          chapters: {
            some: {
              lessons: {
                some: {
                  assessmentPlacements: {
                    some: {
                      id: placementId
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
  }

  countAttempts(userId: string, placementId: string): Promise<number> {
    return prisma.submission.count({
      where: {
        studentId: userId,
        placementId
      }
    })
  }

  findDoingSubmissionForPlacement(
    userId: string,
    placementId: string
  ): Promise<SubmissionDetail | null> {
    return prisma.submission.findFirst({
      where: {
        studentId: userId,
        placementId,
        status: SubmissionStatus.doing
      },
      orderBy: {
        attemptNumber: 'desc'
      },
      include: {
        mcqAnswers: {
          include: {
            selectedOptions: true
          }
        },
        tfAnswers: true,
        numericAnswers: true,
        essayAnswers: true
      }
    })
  }

  createSubmission(data: {
    userId: string
    assessmentId: string
    placementId: string
    attemptNumber: number
  }): Promise<SubmissionDetail> {
    return prisma.submission.create({
      data: {
        studentId: data.userId,
        assessmentId: data.assessmentId,
        placementId: data.placementId,
        attemptNumber: data.attemptNumber
      },
      include: {
        mcqAnswers: {
          include: {
            selectedOptions: true
          }
        },
        tfAnswers: true,
        numericAnswers: true,
        essayAnswers: true
      }
    })
  }

  findSubmissionForStudent(
    submissionId: string,
    userId: string
  ): Promise<StudentSubmissionComplete | null> {
    return prisma.submission.findFirst({
      where: {
        id: submissionId,
        studentId: userId
      },
      include: answerInclude
    })
  }

  async listExpiredDoingSubmissions(data: {
    now: Date
    limit: number
  }): Promise<StudentSubmissionComplete[]> {
    const expiredIds = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT submission.id
      FROM submissions AS submission
      INNER JOIN assessments AS assessment ON assessment.id = submission.assessment_id
      LEFT JOIN assessment_placements AS placement ON placement.id = submission.placement_id
      WHERE submission.status = 'doing'
        AND (
          placement.close_time <= ${data.now}
          OR (
            assessment.time_limit_minutes IS NOT NULL
            AND submission.start_time
              + assessment.time_limit_minutes * INTERVAL '1 minute' <= ${data.now}
          )
        )
      ORDER BY submission.start_time ASC, submission.id ASC
      LIMIT ${data.limit}
    `)

    if (expiredIds.length === 0) return []

    return prisma.submission.findMany({
      where: {
        id: { in: expiredIds.map((record) => record.id) },
        status: SubmissionStatus.doing
      },
      include: answerInclude
    })
  }

  async saveAnswers(submissionId: string, answers: SaveAnswerDto[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      for (const answer of answers) {
        if (answer.type === AssessmentItemType.mcq) {
          const mcqAnswer = await tx.submissionMcqAnswer.upsert({
            where: {
              submissionId_itemId: {
                submissionId,
                itemId: answer.itemId
              }
            },
            create: {
              submissionId,
              itemId: answer.itemId
            },
            update: {
              isCorrect: null,
              pointEarned: 0
            }
          })

          await tx.submissionMcqSelectedOption.deleteMany({
            where: {
              answerId: mcqAnswer.id
            }
          })

          await tx.submissionMcqSelectedOption.createMany({
            data: answer.selectedOptionIds.map((optionId) => ({
              answerId: mcqAnswer.id,
              optionId
            })),
            skipDuplicates: true
          })
        }

        if (answer.type === AssessmentItemType.true_false) {
          for (const selection of answer.selections) {
            await tx.submissionTfAnswer.upsert({
              where: {
                submissionId_itemId_optionId: {
                  submissionId,
                  itemId: answer.itemId,
                  optionId: selection.optionId
                }
              },
              create: {
                submissionId,
                itemId: answer.itemId,
                optionId: selection.optionId,
                selectedValue: selection.selectedValue
              },
              update: {
                selectedValue: selection.selectedValue,
                isCorrect: null,
                pointEarned: 0
              }
            })
          }
        }

        if (answer.type === AssessmentItemType.numeric) {
          await tx.submissionNumericAnswer.upsert({
            where: {
              submissionId_itemId: {
                submissionId,
                itemId: answer.itemId
              }
            },
            create: {
              submissionId,
              itemId: answer.itemId,
              answerValue: answer.answerValue
            },
            update: {
              answerValue: answer.answerValue,
              isCorrect: null,
              pointEarned: 0
            }
          })
        }

        if (answer.type === AssessmentItemType.essay) {
          await tx.submissionEssayAnswer.upsert({
            where: {
              submissionId_itemId: {
                submissionId,
                itemId: answer.itemId
              }
            },
            create: {
              submissionId,
              itemId: answer.itemId,
              answer: answer.answer
            },
            update: {
              answer: answer.answer,
              teacherScore: null,
              teacherNote: null,
              gradedBy: null,
              gradedAt: null
            }
          })
        }
      }
    })
  }

  recordViolation(submissionId: string): Promise<StudentSubmissionComplete | null> {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.submission.updateMany({
        where: {
          id: submissionId,
          status: SubmissionStatus.doing,
          violationCount: { lt: 5 }
        },
        data: {
          violationCount: { increment: 1 }
        }
      })

      if (updated.count === 0) return null

      return tx.submission.findUnique({
        where: { id: submissionId },
        include: answerInclude
      })
    })
  }

  async finalizeSubmission(data: {
    submissionId: string
    mcqResults: Array<{ answerId: string; isCorrect: boolean; pointEarned: string }>
    tfResults: Array<{ answerId: string; isCorrect: boolean; pointEarned: string }>
    numericResults: Array<{ answerId: string; isCorrect: boolean; pointEarned: string }>
    autoScore: string
    status: SubmissionStatus
    finalScore: string | null
    essayItemIds: string[]
  }): Promise<{ submission: StudentSubmissionComplete; didFinalize: boolean }> {
    return prisma.$transaction(async (tx) => {
      const claimed = await tx.submission.updateMany({
        where: {
          id: data.submissionId,
          status: SubmissionStatus.doing
        },
        data: {
          submitTime: new Date(),
          status: data.status,
          autoScore: new Prisma.Decimal(data.autoScore),
          finalScore: data.finalScore === null ? null : new Prisma.Decimal(data.finalScore)
        }
      })

      if (claimed.count === 0) {
        const submission = await tx.submission.findUniqueOrThrow({
          where: { id: data.submissionId },
          include: answerInclude
        })
        return { submission, didFinalize: false }
      }

      for (const result of data.mcqResults) {
        await tx.submissionMcqAnswer.update({
          where: { id: result.answerId },
          data: {
            isCorrect: result.isCorrect,
            pointEarned: new Prisma.Decimal(result.pointEarned)
          }
        })
      }

      for (const result of data.tfResults) {
        await tx.submissionTfAnswer.update({
          where: { id: result.answerId },
          data: {
            isCorrect: result.isCorrect,
            pointEarned: new Prisma.Decimal(result.pointEarned)
          }
        })
      }

      for (const result of data.numericResults) {
        await tx.submissionNumericAnswer.update({
          where: { id: result.answerId },
          data: {
            isCorrect: result.isCorrect,
            pointEarned: new Prisma.Decimal(result.pointEarned)
          }
        })
      }

      if (data.essayItemIds.length > 0) {
        await tx.submissionEssayAnswer.createMany({
          data: data.essayItemIds.map((itemId) => ({
            submissionId: data.submissionId,
            itemId,
            answer: ''
          })),
          skipDuplicates: true
        })
      }

      const submission = await tx.submission.findUniqueOrThrow({
        where: { id: data.submissionId },
        include: answerInclude
      })

      return { submission, didFinalize: true }
    })
  }
}
