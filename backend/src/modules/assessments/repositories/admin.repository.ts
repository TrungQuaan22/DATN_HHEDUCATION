import {
  AssessmentItemType,
  AssessmentPlacementType,
  AssessmentType,
  AssessmentVisibility,
  CourseStatus,
  MediaStatus,
  MediaType,
  Prisma,
  QuestionSource,
  QuestionStatus,
  SubmissionStatus,
  UserRole,
  Assessment,
  AssessmentPlacement,
  AssessmentSection,
  AssessmentItem,
  SubmissionEssayAnswer
} from '@prisma/client'

import { prisma } from '~/config/db'

import type {
  CreateAssessmentItemDto,
  CreateAssessmentDto,
  CreatePlacementDto
} from '../dto'
import type {
  AdminAssessmentRepositoryPort,
  ListAdminAssessmentsFilters
} from '../ports/admin-assessment-repository.port'
import {
  placementAccessInclude,
  answerInclude
} from './shared'
import {
  toDecimal,
  toExamOptionLabel,
  buildQuestionContent,
  buildSourceRef,
  buildExplanation,
  buildCorrectAnswer,
  buildScoringConfig,
  toQuestionType,
  normalizeTopicName
} from '../helpers/assessment.helper'
import type {
  AdminAssessmentListItem,
  GradingSubmissionListItem,
  AdminAssessmentDetail,
  AssessmentForPublishDetail,
  SectionItemDetail,
  StudentSubmissionComplete,
  AssessmentItemUnion
} from '../types'

const buildCourseFilters = (courseId: string): Prisma.AssessmentWhereInput => ({
  placements: {
    some: {
      OR: [
        { type: AssessmentPlacementType.course, courseId },
        { type: AssessmentPlacementType.lesson, lesson: { chapter: { courseId } } }
      ]
    }
  }
})

const buildScopeFilters = (filters: ListAdminAssessmentsFilters): Prisma.AssessmentWhereInput => {
  if (filters.scope === 'public') {
    return { placements: { some: { type: AssessmentPlacementType.public_practice } } }
  }

  if (filters.scope === 'course' && filters.courseId) {
    return buildCourseFilters(filters.courseId)
  }

  if (filters.scope === 'unplaced') {
    return { placements: { none: {} } }
  }

  return {}
}

const buildTeacherFilters = (teacherId: string): Prisma.AssessmentWhereInput => ({
  OR: [
    { createdById: teacherId },
    {
      placements: {
        some: {
          OR: [
            { course: { teacherId } },
            { lesson: { chapter: { course: { teacherId } } } }
          ]
        }
      }
    }
  ]
})

export class PrismaAdminAssessmentRepository implements AdminAssessmentRepositoryPort {
  listAdminAssessments(data: {
    filters: ListAdminAssessmentsFilters
    skip: number
    take: number
  }): Promise<[AdminAssessmentListItem[], number]> {
    const where: Prisma.AssessmentWhereInput = {
      deletedAt: null,
      visibility: data.filters.visibility,
      subject: data.filters.subject,
      grade: data.filters.grade,
      gradingType: data.filters.gradingType,
      AND: [
        buildScopeFilters(data.filters),
        ...(data.filters.teacherId ? [buildTeacherFilters(data.filters.teacherId)] : [])
      ]
    }

    return prisma.$transaction([
      prisma.assessment.findMany({
        where,
        skip: data.skip,
        take: data.take,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          placements: {
            include: placementAccessInclude
          },
          _count: {
            select: {
              items: true,
              sections: true,
              submissions: true
            }
          }
        }
      }),
      prisma.assessment.count({
        where
      })
    ])
  }

  listGradingSubmissions(data: {
    actor: { id: string; role: UserRole }
    assessmentId?: string
    skip: number
    take: number
  }): Promise<[GradingSubmissionListItem[], number]> {
    const teacherAccessWhere: Prisma.SubmissionWhereInput | undefined =
      data.actor.role === UserRole.teacher
        ? {
            OR: [
              {
                assessment: {
                  createdById: data.actor.id
                }
              },
              {
                placement: {
                  course: {
                    teacherId: data.actor.id
                  }
                }
              },
              {
                placement: {
                  lesson: {
                    chapter: {
                      course: {
                        teacherId: data.actor.id
                      }
                    }
                  }
                }
              }
            ]
          }
        : undefined

    const where: Prisma.SubmissionWhereInput = {
      assessmentId: data.assessmentId,
      status: SubmissionStatus.submitted,
      assessment: {
        gradingType: {
          in: ['manual', 'mixed']
        },
        deletedAt: null
      },
      AND: teacherAccessWhere ? [teacherAccessWhere] : undefined
    }

    return prisma.$transaction([
      prisma.submission.findMany({
        where,
        skip: data.skip,
        take: data.take,
        orderBy: {
          submitTime: 'asc'
        },
        include: {
          assessment: true,
          placement: {
            include: placementAccessInclude
          },
          student: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          essayAnswers: true
        }
      }),
      prisma.submission.count({ where })
    ])
  }

  createAssessment(data: CreateAssessmentDto) {
    return prisma.assessment.create({
      data: {
        title: data.title,
        subject: data.subject,
        grade: data.grade,
        type: data.type,
        gradingType: data.gradingType,
        timeLimitMinutes: data.timeLimitMinutes,
        sourceMediaId: data.sourceMediaId,
        createdById: data.createdById,
        sourceMetadata: data.sourceMediaId ? { importMode: 'pdf_answer_key' } : undefined
      }
    })
  }

  updateAssessment(id: string, data: Partial<CreateAssessmentDto>) {
    return prisma.assessment.update({
      where: { id },
      data: {
        title: data.title,
        subject: data.subject,
        grade: data.grade,
        type: data.type,
        gradingType: data.gradingType,
        timeLimitMinutes: data.timeLimitMinutes,
        sourceMediaId: data.sourceMediaId,
        sourceMetadata: data.sourceMediaId ? { importMode: 'pdf_answer_key' } : undefined
      }
    })
  }

  createSection(data: {
    assessmentId: string
    title: string
    description?: string | null
    itemType: AssessmentItemType
  }): Promise<AssessmentSection & { items: AssessmentItem[] }> {
    return prisma.$transaction(async (tx) => {
      const lastSection = await tx.assessmentSection.findFirst({
        where: {
          assessmentId: data.assessmentId
        },
        orderBy: {
          orderIndex: 'desc'
        },
        select: {
          orderIndex: true
        }
      })

      return tx.assessmentSection.create({
        data: {
          assessmentId: data.assessmentId,
          title: data.title,
          description: data.description ?? null,
          itemType: data.itemType,
          orderIndex: (lastSection?.orderIndex ?? 0) + 1000
        },
        include: {
          items: true
        }
      })
    })
  }

  updateSection(data: {
    assessmentId: string
    sectionId: string
    title?: string
    description?: string | null
  }): Promise<AssessmentSection & { items: AssessmentItem[] }> {
    return prisma.assessmentSection.update({
      where: {
        id: data.sectionId,
        assessmentId: data.assessmentId
      },
      data: {
        title: data.title,
        description: data.description
      },
      include: {
        items: {
          orderBy: {
            orderIndex: 'asc'
          }
        }
      }
    })
  }

  async deleteSection(assessmentId: string, sectionId: string): Promise<AssessmentSection | null> {
    const section = await prisma.assessmentSection.findFirst({
      where: {
        id: sectionId,
        assessmentId
      },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    })

    if (!section || section._count.items > 0) {
      return section
    }

    return prisma.assessmentSection.delete({
      where: {
        id: sectionId
      }
    })
  }

  findAssessmentById(id: string): Promise<AdminAssessmentDetail | null> {
    return prisma.assessment.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        sections: {
          include: {
            items: {
              include: {
                question: {
                  include: {
                    options: {
                      orderBy: {
                        orderIndex: 'asc'
                      }
                    }
                  }
                }
              },
              orderBy: {
                orderIndex: 'asc'
              }
            }
          }
        },
        placements: {
          include: placementAccessInclude
        },
        _count: {
          select: {
            items: true,
            sections: true,
            submissions: true
          }
        }
      }
    })
  }

  findAssessmentForPublish(id: string): Promise<AssessmentForPublishDetail | null> {
    return prisma.assessment.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        sourceMedia: true,
        createdBy: {
          select: {
            role: true
          }
        },
        placements: {
          include: placementAccessInclude
        },
        _count: {
          select: {
            submissions: true
          }
        },
        sections: {
          orderBy: {
            orderIndex: 'asc'
          },
          include: {
            items: {
              orderBy: {
                orderIndex: 'asc'
              },
              include: {
                topic: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                question: {
                  include: {
                    options: true
                  }
                }
              }
            }
          }
        }
      }
    })
  }

  findDocumentMediaById(id: string) {
    return prisma.media.findFirst({
      where: {
        id,
        type: MediaType.document,
        status: MediaStatus.ready,
        mimeType: 'application/pdf'
      }
    })
  }

  findCourseForPlacement(courseId: string) {
    return prisma.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null,
        status: {
          in: [CourseStatus.draft, CourseStatus.published]
        }
      },
      select: {
        id: true,
        subject: true,
        grade: true,
        teacherId: true
      }
    })
  }

  findLessonForPlacement(lessonId: string) {
    return prisma.lesson.findFirst({
      where: {
        id: lessonId,
        deletedAt: null,
        chapter: {
          deletedAt: null,
          course: {
            deletedAt: null,
            status: {
              in: [CourseStatus.draft, CourseStatus.published]
            }
          }
        }
      },
      select: {
        id: true,
        type: true,
        chapter: {
          select: {
            course: {
              select: {
                id: true,
                subject: true,
                grade: true,
                teacherId: true
              }
            }
          }
        }
      }
    })
  }

  listTopicsByCourse(courseId: string) {
    return prisma.topic.findMany({
      where: {
        courseId
      },
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        parentId: true,
        courseId: true
      }
    })
  }

  findSectionInAssessment(assessmentId: string, sectionId: string): Promise<(AssessmentSection & { items: AssessmentItem[] }) | null> {
    return prisma.assessmentSection.findFirst({
      where: {
        id: sectionId,
        assessmentId
      },
      include: {
        items: {
          orderBy: {
            orderIndex: 'asc'
          }
        }
      }
    })
  }

  async createSectionItems(data: {
    assessmentId: string
    sectionId: string
    assessmentType: AssessmentType
    items: CreateAssessmentItemDto[]
    courseId?: string | null
  }): Promise<SectionItemDetail[] | null> {
    return prisma.$transaction(async (tx) => {
      const section = await tx.assessmentSection.findFirst({
        where: {
          id: data.sectionId,
          assessmentId: data.assessmentId
        },
        select: {
          id: true,
          assessmentId: true,
          itemType: true
        }
      })

      if (!section) {
        return null
      }

      const lastItem = await tx.assessmentItem.findFirst({
        where: {
          sectionId: section.id
        },
        orderBy: {
          orderIndex: 'desc'
        },
        select: {
          orderIndex: true
        }
      })

      const createdItems = []
      let nextOrderIndex = (lastItem?.orderIndex ?? 0) + 1000

      for (const item of data.items) {
        let topicId = item.topicId ?? null

        if (data.courseId && !topicId && item.topicName) {
          const topicName = normalizeTopicName(item.topicName)
          const existingTopic = await tx.topic.findFirst({
            where: {
              courseId: data.courseId,
              parentId: null,
              name: {
                equals: topicName,
                mode: 'insensitive'
              }
            },
            select: {
              id: true
            }
          })

          topicId =
            existingTopic?.id ??
            (
              await tx.topic.create({
                data: {
                  courseId: data.courseId,
                  name: topicName
                },
                select: {
                  id: true
                }
              })
            ).id
        }

        const question = await tx.question.create({
          data: {
            topicId,
            difficulty: item.difficulty,
            type: toQuestionType(section.itemType),
            source: QuestionSource.generated_exam,
            sourceRef: buildSourceRef(data.assessmentId, data.sectionId, section.itemType),
            content: buildQuestionContent(item, data.assessmentType, section.itemType),
            explanation: buildExplanation(item),
            status: QuestionStatus.hidden,
            options:
              section.itemType === AssessmentItemType.mcq
                ? {
                    create: 'optionCount' in item
                      ? Array.from({ length: item.optionCount }, (_, index) => {
                          const label = toExamOptionLabel(index)

                          return {
                            content: { label, generated: true },
                            isCorrect: item.correctOptions.includes(label),
                            orderIndex: index
                          }
                        })
                      : (item as AssessmentItemUnion).options!.map((option: { content: string; isCorrect: boolean }, index: number) => ({
                          content: { label: option.content },
                          isCorrect: option.isCorrect,
                          orderIndex: index
                        }))
                  }
                : section.itemType === AssessmentItemType.true_false
                  ? {
                      create: (item as AssessmentItemUnion).statements!.map((statement: { label?: string; correctValue: boolean }, index: number) => ({
                        content: {
                          label: 'label' in statement && statement.label ? statement.label : `Mệnh đề ${index + 1}`,
                          generated: !('label' in statement)
                        },
                        isCorrect: statement.correctValue,
                        orderIndex: index
                      }))
                    }
                  : undefined
          }
        })

        createdItems.push(
          await tx.assessmentItem.create({
            data: {
              assessmentId: data.assessmentId,
              sectionId: data.sectionId,
              questionId: question.id,
              topicId,
              difficulty: item.difficulty,
              orderIndex: nextOrderIndex,
              itemType: section.itemType,
              correctAnswer: buildCorrectAnswer(item, section.itemType),
              explanation: buildExplanation(item),
              scoringConfig: buildScoringConfig(item, section.itemType),
              maxScore: toDecimal(item.maxScore)
            },
            include: {
              question: {
                include: {
                  options: {
                    orderBy: {
                      orderIndex: 'asc'
                    }
                  }
                }
              },
              section: true
            }
          })
        )

        nextOrderIndex += 1000
      }

      return createdItems
    })
  }

  async updateSectionItem(data: {
    assessmentId: string
    itemId: string
    item: Partial<CreateAssessmentItemDto>
  }): Promise<SectionItemDetail | null> {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.assessmentItem.findFirst({
        where: {
          id: data.itemId,
          assessmentId: data.assessmentId
        },
        include: {
          assessment: {
            select: {
              type: true
            }
          },
          section: true,
          question: {
            include: {
              options: true
            }
          }
        }
      })

      if (!existing) {
        return null
      }

      const itemType = existing.section.itemType
      const currentContent = existing.question?.content as { label?: string } | null
      const currentCorrectAnswer = existing.correctAnswer as {
        value?: number
        correctOptions?: string[]
      } | null
      const currentScoringConfig = existing.scoringConfig as { mode?: string; rubric?: unknown } | null
      const mergedItem = {
        topicId: existing.topicId,
        difficulty: existing.difficulty,
        maxScore: Number(existing.maxScore),
        explanation: typeof existing.explanation === 'string' ? existing.explanation : null,
        contentLabel: currentContent?.label ?? '',
        mode: currentScoringConfig?.mode ?? 'single',
        options: existing.question?.options.map((option) => ({
          content:
            typeof option.content === 'object' && option.content && 'label' in option.content
              ? String((option.content as { label?: unknown }).label ?? '')
              : String(option.content ?? ''),
          isCorrect: option.isCorrect
        })) ?? [],
        optionCount: existing.question?.options.length ?? 0,
        correctOptions:
          currentCorrectAnswer?.correctOptions ??
          existing.question?.options
            .filter((option) => option.isCorrect)
            .map((option) => toExamOptionLabel(option.orderIndex)) ?? [],
        statements: existing.question?.options.map((option) => ({
          label:
            typeof option.content === 'object' && option.content && 'label' in option.content
              ? String((option.content as { label?: unknown }).label ?? '')
              : String(option.content ?? ''),
          correctValue: option.isCorrect
        })) ?? [],
        correctAnswer: currentCorrectAnswer?.value,
        rubric: currentScoringConfig?.rubric,
        ...data.item
      } as CreateAssessmentItemDto
      const nextQuestionData: Prisma.QuestionUpdateInput = {}

      if ('difficulty' in data.item && data.item.difficulty !== undefined) {
        nextQuestionData.difficulty = data.item.difficulty
      }

      if ('contentLabel' in data.item || 'explanation' in data.item) {
        if ('contentLabel' in data.item) {
          nextQuestionData.content = buildQuestionContent(
            mergedItem,
            existing.assessment.type,
            itemType
          )
        }
        if ('explanation' in data.item) {
          nextQuestionData.explanation = buildExplanation(mergedItem)
        }
      }

      if (existing.questionId && Object.keys(nextQuestionData).length > 0) {
        await tx.question.update({
          where: {
            id: existing.questionId
          },
          data: nextQuestionData
        })
      }

      if (
        existing.questionId &&
        (itemType === AssessmentItemType.mcq || itemType === AssessmentItemType.true_false) &&
        ('options' in data.item || 'optionCount' in data.item || 'correctOptions' in data.item || 'statements' in data.item)
      ) {
        await tx.questionOption.deleteMany({
          where: {
            questionId: existing.questionId
          }
        })

        if (itemType === AssessmentItemType.mcq) {
          if (existing.assessment.type === AssessmentType.exam) {
            const examItem = mergedItem as AssessmentItemUnion
            await tx.questionOption.createMany({
              data: Array.from({ length: examItem.optionCount! }, (_, index) => {
                const label = toExamOptionLabel(index)
                return {
                  questionId: existing.questionId!,
                  content: { label, generated: true },
                  isCorrect: examItem.correctOptions!.includes(label),
                  orderIndex: index
                }
              })
            })
          } else {
            const quizItem = mergedItem as AssessmentItemUnion
            await tx.questionOption.createMany({
              data: quizItem.options!.map((option: { content: string; isCorrect: boolean }, index: number) => ({
                questionId: existing.questionId!,
                content: { label: option.content },
                isCorrect: option.isCorrect,
                orderIndex: index
              }))
            })
          }
        }

        if (itemType === AssessmentItemType.true_false && 'statements' in data.item) {
          const tfItem = mergedItem as AssessmentItemUnion
          await tx.questionOption.createMany({
            data: tfItem.statements!.map((statement: { label?: string; correctValue: boolean }, index: number) => ({
              questionId: existing.questionId!,
              content: {
                label: 'label' in statement && statement.label ? statement.label : `Mệnh đề ${index + 1}`,
                generated: !('label' in statement && statement.label)
              },
              isCorrect: statement.correctValue,
              orderIndex: index
            }))
          })
        }
      }

      return tx.assessmentItem.update({
        where: {
          id: existing.id
        },
        data: {
          topicId: data.item.topicId,
          difficulty: data.item.difficulty,
          correctAnswer:
            'correctAnswer' in data.item || 'correctOptions' in data.item || 'options' in data.item || 'statements' in data.item
              ? buildCorrectAnswer(mergedItem, itemType)
              : undefined,
          explanation: 'explanation' in data.item ? buildExplanation(mergedItem) : undefined,
          scoringConfig:
            'mode' in data.item || 'rubric' in data.item || 'correctOptions' in data.item || 'options' in data.item || 'statements' in data.item
              ? buildScoringConfig(mergedItem, itemType)
              : undefined,
          maxScore: data.item.maxScore !== undefined ? toDecimal(data.item.maxScore) : undefined
        },
        include: {
          question: {
            include: {
              options: {
                orderBy: {
                  orderIndex: 'asc'
                }
              }
            }
          },
          section: true
        }
      })
    })
  }

  async deleteSectionItem(assessmentId: string, itemId: string): Promise<{ id: string; questionId: string | null } | null> {
    return prisma.$transaction(async (tx) => {
      const item = await tx.assessmentItem.findFirst({
        where: {
          id: itemId,
          assessmentId
        },
        select: {
          id: true,
          questionId: true,
          question: {
            select: {
              source: true
            }
          }
        }
      })

      if (!item) {
        return null
      }

      await tx.assessmentItem.delete({
        where: {
          id: item.id
        }
      })

      if (item.questionId && item.question?.source === QuestionSource.generated_exam) {
        await tx.question.delete({
          where: {
            id: item.questionId
          }
        })
      }

      return item
    })
  }

  publishAssessment(id: string): Promise<Assessment> {
    return prisma.assessment.update({
      where: { id },
      data: {
        visibility: AssessmentVisibility.published,
        publishedAt: new Date(),
        hiddenAt: null
      }
    })
  }

  updateVisibility(id: string, visibility: AssessmentVisibility): Promise<Assessment> {
    return prisma.assessment.update({
      where: { id },
      data: {
        visibility,
        publishedAt: visibility === AssessmentVisibility.published ? new Date() : null,
        hiddenAt: visibility === AssessmentVisibility.hidden ? new Date() : null
      }
    })
  }

  createPlacement(data: CreatePlacementDto): Promise<AssessmentPlacement & { assessment: Assessment }> {
    return prisma.assessmentPlacement.create({
      data: {
        assessmentId: data.assessmentId,
        type: data.type,
        courseId: data.courseId,
        lessonId: data.lessonId,
        openTime: data.openTime ? new Date(data.openTime) : null,
        closeTime: data.closeTime ? new Date(data.closeTime) : null,
        maxAttempts: data.maxAttempts,
        slug: data.slug,
        isFeatured: data.isFeatured ?? false,
        orderIndex: data.orderIndex
      },
      include: {
        assessment: true
      }
    })
  }

  upsertSinglePlacement(assessmentId: string, data: Omit<CreatePlacementDto, 'assessmentId'>): Promise<AssessmentPlacement & { assessment: Assessment }> {
    return prisma.$transaction(async (tx) => {
      await tx.assessmentPlacement.deleteMany({
        where: {
          assessmentId
        }
      })

      return tx.assessmentPlacement.create({
        data: {
          assessmentId,
          type: data.type,
          courseId: data.courseId,
          lessonId: data.lessonId,
          openTime: data.openTime ? new Date(data.openTime) : null,
          closeTime: data.closeTime ? new Date(data.closeTime) : null,
          maxAttempts: data.maxAttempts,
          slug: data.slug,
          isFeatured: data.isFeatured ?? false,
          orderIndex: data.orderIndex
        },
        include: {
          assessment: true
        }
      })
    })
  }

  deleteSinglePlacement(assessmentId: string): Promise<Assessment | { id: string; visibility: AssessmentVisibility } | null> {
    return prisma.$transaction(async (tx) => {
      await tx.assessmentPlacement.deleteMany({
        where: {
          assessmentId
        }
      })

      const assessment = await tx.assessment.findUnique({
        where: {
          id: assessmentId
        },
        select: {
          id: true,
          visibility: true
        }
      })

      if (assessment?.visibility === AssessmentVisibility.published) {
        return tx.assessment.update({
          where: {
            id: assessmentId
          },
          data: {
            visibility: AssessmentVisibility.draft,
            publishedAt: null
          }
        })
      }

      return assessment
    })
  }

  findDuplicatePlacement(data: CreatePlacementDto): Promise<AssessmentPlacement | null> {
    return prisma.assessmentPlacement.findFirst({
      where: {
        type: data.type,
        OR: [
          data.type === AssessmentPlacementType.public_practice && data.slug
            ? { slug: data.slug }
            : undefined,
          data.type === AssessmentPlacementType.course && data.courseId
            ? { assessmentId: data.assessmentId, courseId: data.courseId }
            : undefined,
          data.type === AssessmentPlacementType.lesson && data.lessonId
            ? { lessonId: data.lessonId }
            : undefined
        ].filter(Boolean) as Prisma.AssessmentPlacementWhereInput[]
      }
    })
  }

  findSubmissionForGrading(submissionId: string): Promise<StudentSubmissionComplete | null> {
    return prisma.submission.findUnique({
      where: {
        id: submissionId
      },
      include: answerInclude
    })
  }

  async cloneAssessment(data: {
    assessmentId: string
    createdById: string
    title: string
  }) {
    const source = await prisma.assessment.findFirst({
      where: {
        id: data.assessmentId,
        deletedAt: null
      },
      include: {
        sections: {
          orderBy: {
            orderIndex: 'asc'
          },
          include: {
            items: {
              orderBy: {
                orderIndex: 'asc'
              },
              include: {
                question: {
                  include: {
                    options: {
                      orderBy: {
                        orderIndex: 'asc'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!source) {
      return null
    }

    return prisma.$transaction(async (tx) => {
      const createdAssessment = await tx.assessment.create({
        data: {
          title: data.title,
          subject: source.subject,
          grade: source.grade,
          type: source.type,
          gradingType: source.gradingType,
          timeLimitMinutes: source.timeLimitMinutes,
          sourceMediaId: source.sourceMediaId,
          sourceMetadata: source.sourceMetadata ?? undefined,
          createdById: data.createdById
        }
      })

      for (const section of source.sections) {
        const createdSection = await tx.assessmentSection.create({
          data: {
            assessmentId: createdAssessment.id,
            title: section.title,
            description: section.description,
            itemType: section.itemType,
            orderIndex: section.orderIndex
          }
        })

        for (const item of section.items) {
          const question = item.question
            ? await tx.question.create({
                data: {
                  topicId: item.question.topicId,
                  difficulty: item.question.difficulty,
                  type: item.question.type,
                  source: QuestionSource.generated_exam,
                  sourceRef: {
                    clonedFromAssessmentId: source.id,
                    clonedFromQuestionId: item.question.id,
                    assessmentId: createdAssessment.id,
                    sectionId: createdSection.id,
                    itemType: item.itemType
                  },
                  content: item.question.content as Prisma.InputJsonValue,
                  explanation: item.question.explanation as Prisma.InputJsonValue,
                  status: QuestionStatus.hidden,
                  options: {
                    create: item.question.options.map((option) => ({
                      content: option.content as Prisma.InputJsonValue,
                      isCorrect: option.isCorrect,
                      orderIndex: option.orderIndex
                    }))
                  }
                }
              })
            : null

          await tx.assessmentItem.create({
            data: {
              assessmentId: createdAssessment.id,
              sectionId: createdSection.id,
              questionId: question?.id,
              topicId: item.topicId,
              difficulty: item.difficulty,
              orderIndex: item.orderIndex,
              itemType: item.itemType,
              correctAnswer: item.correctAnswer as Prisma.InputJsonValue,
              explanation: item.explanation as Prisma.InputJsonValue,
              scoringConfig: item.scoringConfig as Prisma.InputJsonValue,
              maxScore: item.maxScore
            }
          })
        }
      }

      return createdAssessment
    })
  }

  gradeEssay(data: {
    submissionId: string
    itemId: string
    teacherScore: number
    teacherNote?: string | null
    gradedBy: string
  }): Promise<SubmissionEssayAnswer> {
    return prisma.submissionEssayAnswer.update({
      where: {
        submissionId_itemId: {
          submissionId: data.submissionId,
          itemId: data.itemId
        }
      },
      data: {
        teacherScore: toDecimal(data.teacherScore),
        teacherNote: data.teacherNote,
        gradedBy: data.gradedBy,
        gradedAt: new Date()
      }
    })
  }

  finalizeSubmission(submissionId: string, finalScore: number | string): Promise<StudentSubmissionComplete> {
    return prisma.submission.update({
      where: {
        id: submissionId
      },
      data: {
        status: SubmissionStatus.completed,
        finalScore: toDecimal(finalScore)
      },
      include: answerInclude
    })
  }
}

export const adminAssessmentRepository = new PrismaAdminAssessmentRepository()
