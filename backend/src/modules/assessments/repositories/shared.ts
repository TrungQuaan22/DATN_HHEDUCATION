import {
  AssessmentItemType,
  AssessmentType,
  Prisma,
  QuestionSource,
  QuestionStatus,
  QuestionType
} from '@prisma/client'

export const placementAccessInclude = {
  course: {
    select: {
      teacherId: true
    }
  },
  lesson: {
    select: {
      chapter: {
        select: {
          course: {
            select: {
              teacherId: true
            }
          }
        }
      }
    }
  }
}

export const runtimeAssessmentInclude = {
  assessment: {
    include: {
      sourceMedia: true,
      sections: {
        orderBy: {
          orderIndex: 'asc' as const
        },
        include: {
          items: {
            orderBy: {
              orderIndex: 'asc' as const
            },
            include: {
              question: {
                include: {
                  options: {
                    orderBy: {
                      orderIndex: 'asc' as const
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
}

export const runtimeAssessmentPreviewInclude = {
  assessment: {
    include: {
      sections: {
        orderBy: {
          orderIndex: 'asc' as const
        },
        include: {
          items: {
            orderBy: {
              orderIndex: 'asc' as const
            }
          }
        }
      }
    }
  }
}

export const answerInclude = {
  mcqAnswers: {
    include: {
      selectedOptions: true
    }
  },
  tfAnswers: true,
  numericAnswers: true,
  essayAnswers: true,
  assessment: {
    include: {
      sections: {
        orderBy: {
          orderIndex: 'asc' as const
        },
        include: {
          items: {
            orderBy: {
              orderIndex: 'asc' as const
            },
            include: {
              question: {
                include: {
                  options: {
                    orderBy: {
                      orderIndex: 'asc' as const
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  placement: {
    include: placementAccessInclude
  },
  student: {
    select: {
      id: true,
      fullName: true,
      email: true
    }
  }
}

export const toDecimal = (value: number) => new Prisma.Decimal(value)

export const toExamOptionLabel = (index: number) => String.fromCharCode(65 + index)

export const buildQuestionContent = (
  item: any,
  mode: AssessmentType,
  itemType: AssessmentItemType
): Prisma.InputJsonValue => {
  if (mode === 'exam') {
    return {
      kind: 'pdf_exam_answer_key',
      itemType
    }
  }

  return {
    kind: 'quiz_question',
    label: 'contentLabel' in item ? item.contentLabel : ''
  }
}

export const buildSourceRef = (
  assessmentId: string,
  sectionId: string,
  itemType: AssessmentItemType
): Prisma.InputJsonValue => ({
  assessmentId,
  sectionId,
  itemType
})

export const buildExplanation = (item: any): Prisma.InputJsonValue | undefined => {
  const explanation = item.explanation?.trim()
  return explanation ? explanation : undefined
}

export const buildCorrectAnswer = (
  item: any,
  itemType: AssessmentItemType
): Prisma.InputJsonValue | undefined => {
  const data = item as any

  if (itemType === AssessmentItemType.mcq) {
    return {
      correctOptions:
        'correctOptions' in data
          ? data.correctOptions
          : data.options
              .map((option: { isCorrect: boolean }, index: number) => (option.isCorrect ? toExamOptionLabel(index) : null))
              .filter((option: string | null): option is string => Boolean(option))
    }
  }

  if (itemType === AssessmentItemType.true_false) {
    return {
      statements: data.statements.map((statement: { label?: string; correctValue: boolean }, index: number) => ({
        orderIndex: index,
        label: 'label' in statement ? statement.label : `Mệnh đề ${index + 1}`,
        correctValue: statement.correctValue
      }))
    }
  }

  if (itemType === AssessmentItemType.numeric) {
    return {
      value: data.correctAnswer
    }
  }

  return undefined
}

export const buildScoringConfig = (
  item: any,
  itemType: AssessmentItemType
): Prisma.InputJsonValue => {
  const data = item as any

  if (itemType === AssessmentItemType.mcq) {
    return {
      mode: 'mode' in data ? data.mode : data.correctOptions.length > 1 ? 'multiple' : 'single',
      allOrNothing: true
    }
  }

  if (itemType === AssessmentItemType.true_false) {
    return {
      partialCredit: 'correct_count_ratio',
      specialFourStatementScale: true
    }
  }

  if (itemType === AssessmentItemType.numeric) {
    return {
      mode: 'exact'
    }
  }

  return {
    rubric: data.rubric ?? null,
    manual: true
  }
}

export const toQuestionType = (itemType: AssessmentItemType): QuestionType => {
  if (itemType === AssessmentItemType.mcq) {
    return QuestionType.mcq
  }

  if (itemType === AssessmentItemType.true_false) {
    return QuestionType.true_false
  }

  if (itemType === AssessmentItemType.numeric) {
    return QuestionType.numeric
  }

  return QuestionType.essay
}

export const normalizeTopicName = (value: string) => value.trim().replace(/\s+/g, ' ')
