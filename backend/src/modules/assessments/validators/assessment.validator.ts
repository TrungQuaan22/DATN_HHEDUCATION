import {
  AssessmentItemType,
  AssessmentPlacementType,
  AssessmentType,
  AssessmentVisibility,
  GradingType,
  QuestionDifficulty,
  Subject
} from '@prisma/client'
import z from 'zod'

const uuidSchema = z.string().uuid()
const optionalDateSchema = z.string().datetime().nullable().optional()
const topicNameSchema = z.string().trim().min(1).max(100).nullable().optional()
const explanationSchema = z.string().trim().min(1).max(20000).nullable().optional()
const commonItemSchema = {
  topicId: uuidSchema.nullable().optional(),
  topicName: topicNameSchema,
  explanation: explanationSchema,
  difficulty: z.nativeEnum(QuestionDifficulty),
  maxScore: z.number().positive()
}
const quizContentLabelSchema = z.string().trim().min(1).max(20000)
const answerOptionLabelSchema = z.string().trim().regex(/^[A-Z]$/, 'Answer option must be A-Z')
const placementBodySchema = z
  .object({
    type: z.nativeEnum(AssessmentPlacementType),
    courseId: uuidSchema.nullable().optional(),
    lessonId: uuidSchema.nullable().optional(),
    openTime: optionalDateSchema,
    closeTime: optionalDateSchema,
    maxAttempts: z.number().int().positive().nullable().optional(),
    slug: z.string().trim().min(2).max(255).nullable().optional(),
    isFeatured: z.boolean().optional(),
    orderIndex: z.number().int().nullable().optional()
  })
  .strict()

const quizMcqItemSchema = z.object({
  ...commonItemSchema,
  contentLabel: quizContentLabelSchema,
  options: z
    .array(
      z
        .object({
          content: z.string().trim().min(1).max(1000),
          isCorrect: z.boolean()
        })
        .strict()
    )
    .min(2),
  mode: z.enum(['single', 'multiple'])
}).strict()

const examMcqItemSchema = z.object({
  ...commonItemSchema,
  optionCount: z.number().int().min(2).max(26),
  correctOptions: z.array(answerOptionLabelSchema).min(1)
}).strict()

const quizTrueFalseItemSchema = z.object({
  ...commonItemSchema,
  contentLabel: quizContentLabelSchema,
  statements: z
    .array(
      z
        .object({
          label: z.string().trim().min(1).max(1000),
          correctValue: z.boolean()
        })
        .strict()
    )
    .min(1)
}).strict()

const examTrueFalseItemSchema = z.object({
  ...commonItemSchema,
  statements: z
    .array(
      z
        .object({
          correctValue: z.boolean()
        })
        .strict()
    )
    .min(1)
}).strict()

const quizNumericItemSchema = z.object({
  ...commonItemSchema,
  contentLabel: quizContentLabelSchema,
  correctAnswer: z.number()
}).strict()

const examNumericItemSchema = z.object({
  ...commonItemSchema,
  correctAnswer: z.number()
}).strict()

const quizEssayItemSchema = z.object({
  ...commonItemSchema,
  contentLabel: quizContentLabelSchema,
  rubric: z.unknown().optional()
}).strict()

const examEssayItemSchema = z.object({
  ...commonItemSchema,
  rubric: z.unknown().optional()
}).strict()

const sectionItemSchema = z.union([
  quizMcqItemSchema,
  examMcqItemSchema,
  quizTrueFalseItemSchema,
  examTrueFalseItemSchema,
  quizNumericItemSchema,
  examNumericItemSchema,
  quizEssayItemSchema,
  examEssayItemSchema
])

const saveAnswerSchema = z.discriminatedUnion('type', [
  z.object({
    itemId: uuidSchema,
    type: z.literal(AssessmentItemType.mcq),
    selectedOptionIds: z.array(uuidSchema).min(1)
  }),
  z.object({
    itemId: uuidSchema,
    type: z.literal(AssessmentItemType.true_false),
    selections: z
      .array(
        z.object({
          optionId: uuidSchema,
          selectedValue: z.boolean()
        })
      )
      .min(1)
  }),
  z.object({
    itemId: uuidSchema,
    type: z.literal(AssessmentItemType.numeric),
    answerValue: z.number()
  }),
  z.object({
    itemId: uuidSchema,
    type: z.literal(AssessmentItemType.essay),
    answer: z.string().trim().min(1).max(20000)
  })
])

export const createAssessmentSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(2).max(255),
      subject: z.nativeEnum(Subject),
      grade: z.number().int().min(1).max(12),
      type: z.nativeEnum(AssessmentType),
      gradingType: z.nativeEnum(GradingType),
      timeLimitMinutes: z.number().int().positive().nullable().optional(),
      sourceMediaId: uuidSchema.nullable().optional()
    })
    .strict(),
  params: z.object({}).strict(),
  query: z.object({}).optional()
})

export const updateAssessmentSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(2).max(255).optional(),
      subject: z.nativeEnum(Subject).optional(),
      grade: z.number().int().min(1).max(12).optional(),
      gradingType: z.nativeEnum(GradingType).optional(),
      timeLimitMinutes: z.number().int().positive().nullable().optional(),
      sourceMediaId: uuidSchema.nullable().optional()
    })
    .strict(),
  params: z.object({ assessmentId: uuidSchema }).strict(),
  query: z.object({}).optional()
})

export const createAssessmentSectionSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(1).max(255),
      description: z.string().trim().min(1).max(5000).nullable().optional(),
      itemType: z.nativeEnum(AssessmentItemType)
    })
    .strict(),
  params: z.object({ assessmentId: uuidSchema }).strict(),
  query: z.object({}).optional()
})

export const updateAssessmentSectionSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(1).max(255).optional(),
      description: z.string().trim().min(1).max(5000).nullable().optional()
    })
    .strict(),
  params: z.object({ assessmentId: uuidSchema, sectionId: uuidSchema }).strict(),
  query: z.object({}).optional()
})

export const deleteAssessmentSectionSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ assessmentId: uuidSchema, sectionId: uuidSchema }).strict(),
  query: z.object({}).optional()
})

export const createAssessmentItemsSchema = z.object({
  body: z
    .object({
      courseId: uuidSchema.nullable().optional(),
      items: z.array(sectionItemSchema).min(1)
    })
    .strict(),
  params: z.object({ assessmentId: uuidSchema, sectionId: uuidSchema }).strict(),
  query: z.object({}).optional()
})

export const updateAssessmentItemSchema = z.object({
  body: z.object({
    topicId: uuidSchema.nullable().optional(),
    topicName: topicNameSchema,
    explanation: explanationSchema,
    difficulty: z.nativeEnum(QuestionDifficulty).optional(),
    maxScore: z.number().positive().optional(),
    contentLabel: quizContentLabelSchema.optional(),
    options: z.array(z.object({ content: z.string().trim().min(1).max(1000), isCorrect: z.boolean() }).strict()).min(2).optional(),
    mode: z.enum(['single', 'multiple']).optional(),
    optionCount: z.number().int().min(2).max(26).optional(),
    correctOptions: z.array(answerOptionLabelSchema).min(1).optional(),
    statements: z.array(z.union([
      z.object({ label: z.string().trim().min(1).max(1000), correctValue: z.boolean() }).strict(),
      z.object({ correctValue: z.boolean() }).strict()
    ])).min(1).optional(),
    correctAnswer: z.number().optional(),
    rubric: z.unknown().optional()
  }).strict().refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required'
  }),
  params: z.object({ assessmentId: uuidSchema, itemId: uuidSchema }).strict(),
  query: z.object({}).optional()
})

export const deleteAssessmentItemSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ assessmentId: uuidSchema, itemId: uuidSchema }).strict(),
  query: z.object({}).optional()
})


export const createPlacementSchema = z.object({
  body: z
    .object({
      assessmentId: uuidSchema,
      ...placementBodySchema.shape
    })
    .strict(),
  params: z.object({}).strict(),
  query: z.object({}).optional()
})

export const upsertPlacementSchema = z.object({
  body: placementBodySchema,
  params: z.object({ assessmentId: uuidSchema }).strict(),
  query: z.object({}).optional()
})

export const updateAssessmentVisibilitySchema = z.object({
  body: z
    .object({
      visibility: z.nativeEnum(AssessmentVisibility)
    })
    .strict(),
  params: z.object({ assessmentId: uuidSchema }).strict(),
  query: z.object({}).optional()
})

export const cloneAssessmentSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(2).max(255).optional()
    })
    .strict()
    .optional(),
  params: z.object({ assessmentId: uuidSchema }).strict(),
  query: z.object({}).optional()
})

export const listAdminAssessmentsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).strict(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    scope: z.enum(['all', 'public', 'course', 'unplaced']).optional(),
    courseId: uuidSchema.optional(),
    visibility: z.nativeEnum(AssessmentVisibility).optional(),
    subject: z.nativeEnum(Subject).optional(),
    grade: z.coerce.number().int().min(1).max(12).optional(),
    gradingType: z.nativeEnum(GradingType).optional()
  }).superRefine((query, ctx) => {
    if (query.scope === 'course' && !query.courseId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['courseId'],
        message: 'courseId is required when scope is course'
      })
    }
  })
})

export const listGradingSubmissionsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).strict(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    assessmentId: uuidSchema.optional()
  })
})

export const listPublicPlacementsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).strict(),
  query: z.object({
    subject: z.nativeEnum(Subject).optional(),
    grade: z.coerce.number().int().min(1).max(12).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  })
})

export const listStudentAssessmentsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).strict(),
  query: z.object({
    subject: z.nativeEnum(Subject).optional(),
    grade: z.coerce.number().int().min(1).max(12).optional(),
    status: z.enum(['not_started', 'doing', 'submitted', 'auto_submitted', 'completed']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  })
})

export const placementIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ placementId: uuidSchema }).strict(),
  query: z.object({}).optional()
})

export const placementWorkspaceSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ placementId: uuidSchema }).strict(),
  query: z.object({ submissionId: uuidSchema }).strict()
})

export const placementSlugSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ slug: z.string().trim().min(2).max(255) }).strict(),
  query: z.object({}).optional()
})

export const assessmentIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ assessmentId: uuidSchema }).strict(),
  query: z.object({}).optional()
})

export const startAttemptSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ placementId: uuidSchema }).strict(),
  query: z.object({}).optional()
})

export const saveAnswersSchema = z.object({
  body: z
    .object({
      answers: z.array(saveAnswerSchema).min(1)
    })
    .strict(),
  params: z.object({ submissionId: uuidSchema }).strict(),
  query: z.object({}).optional()
})

export const submitAttemptSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ submissionId: uuidSchema }).strict(),
  query: z.object({}).optional()
})

export const gradeEssaySchema = z.object({
  body: z
    .object({
      itemId: uuidSchema,
      teacherScore: z.number().min(0),
      teacherNote: z.string().trim().max(5000).nullable().optional()
    })
    .strict(),
  params: z.object({ submissionId: uuidSchema }).strict(),
  query: z.object({}).optional()
})

export const finalizeManualSubmissionSchema = submitAttemptSchema

export const submissionIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ submissionId: uuidSchema }).strict(),
  query: z.object({}).optional()
})
