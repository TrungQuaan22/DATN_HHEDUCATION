import type {
  Assessment,
  AssessmentItem,
  AssessmentPlacement,
  AssessmentSection,
  Media,
  Question,
  QuestionOption
} from '@prisma/client'
import { mapMediaUrl } from '~/common/mappers/media.mapper'

type PlacementWithAssessment = AssessmentPlacement & {
  assessment: Assessment
}

type RuntimeItem = AssessmentItem & {
  question:
    | (Question & {
        options: QuestionOption[]
      })
    | null
}

type RuntimeSection = AssessmentSection & {
  items: RuntimeItem[]
}

type RuntimePreviewSection = AssessmentSection & {
  items: AssessmentItem[]
}

type RuntimePlacement = AssessmentPlacement & {
  assessment: Assessment & {
    sourceMedia: Media | null
    sections: RuntimeSection[]
  }
}

type RuntimePreviewPlacement = AssessmentPlacement & {
  assessment: Assessment & {
    sections: RuntimePreviewSection[]
  }
}

export const mapAssessmentSummary = (assessment: Assessment) => ({
  id: assessment.id,
  title: assessment.title,
  subject: assessment.subject,
  grade: assessment.grade,
  type: assessment.type,
  gradingType: assessment.gradingType,
  visibility: assessment.visibility
})

export const mapPlacementSummary = (placement: PlacementWithAssessment) => ({
  id: placement.id,
  type: placement.type,
  slug: placement.slug,
  isFeatured: placement.isFeatured,
  assessment: mapAssessmentSummary(placement.assessment)
})

const mapAnswerMode = (item: AssessmentItem) =>
  item.itemType === 'mcq' &&
  item.scoringConfig &&
  typeof item.scoringConfig === 'object' &&
  !Array.isArray(item.scoringConfig) &&
  'mode' in item.scoringConfig &&
  (item.scoringConfig as { mode?: unknown }).mode === 'multiple'
    ? 'multiple'
    : item.itemType === 'mcq'
      ? 'single'
      : null

const mapPreviewSection = (section: RuntimePreviewSection) => ({
  id: section.id,
  title: section.title,
  description: section.description,
  itemType: section.itemType,
  orderIndex: section.orderIndex,
  items: section.items.map((item, index) => ({
    id: item.id,
    orderIndex: item.orderIndex,
    questionNumber: index + 1,
    itemType: item.itemType,
    maxScore: item.maxScore.toString(),
    answerMode: mapAnswerMode(item),
    question: null
  }))
})

const mapWorkspaceSection = (section: RuntimeSection) => ({
  id: section.id,
  title: section.title,
  description: section.description,
  itemType: section.itemType,
  orderIndex: section.orderIndex,
  items: section.items.map((item, index) => ({
    id: item.id,
    orderIndex: item.orderIndex,
    questionNumber: index + 1,
    itemType: item.itemType,
    maxScore: item.maxScore.toString(),
    answerMode: mapAnswerMode(item),
    question: item.question
      ? {
          id: item.question.id,
          type: item.question.type,
          content: item.question.content,
          options: item.question.options.map((option) => ({
            id: option.id,
            content: option.content,
            orderIndex: option.orderIndex
          }))
        }
      : null
  }))
})

export const mapRuntimePlacementPreview = (placement: RuntimePreviewPlacement) => ({
  ...mapPlacementSummary(placement),
  openTime: placement.openTime,
  closeTime: placement.closeTime,
  maxAttempts: placement.maxAttempts,
  timeLimitMinutes: placement.assessment.timeLimitMinutes,
  sections: placement.assessment.sections.map(mapPreviewSection)
})

export const mapRuntimePlacement = (placement: RuntimePlacement) => ({
  ...mapPlacementSummary(placement),
  openTime: placement.openTime,
  closeTime: placement.closeTime,
  maxAttempts: placement.maxAttempts,
  timeLimitMinutes: placement.assessment.timeLimitMinutes,
  sourceMediaId: placement.assessment.sourceMediaId,
  sourceMediaUrl: mapMediaUrl(placement.assessment.sourceMedia?.objectKey),
  sections: placement.assessment.sections.map(mapWorkspaceSection)
})
