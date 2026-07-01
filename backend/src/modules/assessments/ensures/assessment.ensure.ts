import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

export function ensureAssessmentExists<T>(assessment: T | null): T {
  if (!assessment) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment not found')
  }
  return assessment
}

export const ensureAssessmentForPublishExists = ensureAssessmentExists

export function ensureSectionExists<T extends { id: string }>(
  assessment: { sections: T[] },
  sectionId: string
): T {
  const section = assessment.sections.find((item) => item.id === sectionId)
  if (!section) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Section not found')
  }
  return section
}

export function ensureSectionBelongsToAssessment<T extends { id: string }>(
  assessment: { sections: T[] },
  sectionId: string
): T {
  const section = assessment.sections.find((item) => item.id === sectionId)
  if (!section) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Section does not belong to this assessment')
  }
  return section
}

export function ensureItemExists<T extends { id: string }>(
  assessment: { sections: Array<{ items: T[] }> },
  itemId: string
): T {
  const item = assessment.sections.flatMap((section) => section.items).find(({ id }) => id === itemId)
  if (!item) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment item not found')
  }
  return item
}

export function ensureSubmissionForGradingExists<T>(submission: T | null): T {
  if (!submission) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Submission not found')
  }
  return submission
}

export const ensureSubmissionForStudentExists = ensureSubmissionForGradingExists
