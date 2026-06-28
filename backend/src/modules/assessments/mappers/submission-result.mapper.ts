import { AssessmentItemType, SubmissionStatus } from '@prisma/client'

import { mapMediaUrl } from '~/common/mappers/media.mapper'

import type { StudentSubmissionComplete } from '../types'

export type SubmissionResultOutcome = 'correct' | 'incorrect' | 'partial' | 'unanswered'

const getExplanation = (
  item: StudentSubmissionComplete['assessment']['sections'][number]['items'][number]
) => item.explanation ?? item.question?.explanation ?? null

const getNumericCorrectValue = (correctAnswer: unknown): string | null => {
  if (
    correctAnswer &&
    typeof correctAnswer === 'object' &&
    !Array.isArray(correctAnswer) &&
    'value' in correctAnswer
  ) {
    const value = (correctAnswer as { value?: unknown }).value
    return typeof value === 'number' || typeof value === 'string' ? String(value) : null
  }
  return null
}

const getOutcome = (data: {
  hasAnswer: boolean
  pointEarned: string
  maxScore: string
}): SubmissionResultOutcome => {
  if (!data.hasAnswer) return 'unanswered'
  const pointEarned = Number(data.pointEarned)
  const maxScore = Number(data.maxScore)
  if (pointEarned <= 0) return 'incorrect'
  if (pointEarned >= maxScore) return 'correct'
  return 'partial'
}

export function mapStudentSubmissionResult(submission: StudentSubmissionComplete) {
  const reviewAvailable =
    submission.status !== SubmissionStatus.doing &&
    submission.status !== SubmissionStatus.submitted &&
    submission.finalScore !== null
  const maxScore = submission.assessment.sections
    .flatMap((section) => section.items)
    .reduce((total, item) => total + Number(item.maxScore), 0)
    .toString()

  const base = {
    id: submission.id,
    status: submission.status,
    reviewAvailable,
    assessment: {
      id: submission.assessment.id,
      title: submission.assessment.title,
      subject: submission.assessment.subject,
      grade: submission.assessment.grade,
      type: submission.assessment.type,
      gradingType: submission.assessment.gradingType,
      sourceMediaId: reviewAvailable ? submission.assessment.sourceMediaId : null,
      sourceMediaUrl: reviewAvailable
        ? mapMediaUrl(submission.assessment.sourceMedia?.objectKey)
        : null,
      maxScore
    },
    attempt: {
      attemptNumber: submission.attemptNumber,
      startTime: submission.startTime,
      submitTime: submission.submitTime,
      autoScore: submission.autoScore?.toString() ?? null,
      finalScore: submission.finalScore?.toString() ?? null
    }
  }

  if (!reviewAvailable) {
    return {
      ...base,
      summary: null,
      sections: []
    }
  }

  let questionNumber = 0
  const sections = submission.assessment.sections.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    orderIndex: section.orderIndex,
    items: section.items.map((item) => {
      questionNumber += 1
      const maxItemScore = item.maxScore.toString()

      if (item.itemType === AssessmentItemType.mcq) {
        const answer = submission.mcqAnswers.find((entry) => entry.itemId === item.id)
        const selectedIds = new Set(
          answer?.selectedOptions.map((selection) => selection.optionId) ?? []
        )
        const pointEarned = answer?.pointEarned.toString() ?? '0'
        return {
          id: item.id,
          questionNumber,
          itemType: item.itemType,
          maxScore: maxItemScore,
          pointEarned,
          outcome: getOutcome({
            hasAnswer: selectedIds.size > 0,
            pointEarned,
            maxScore: maxItemScore
          }),
          content: item.question?.content ?? null,
          explanation: getExplanation(item),
          options:
            item.question?.options.map((option) => ({
              id: option.id,
              content: option.content,
              orderIndex: option.orderIndex,
              isSelected: selectedIds.has(option.id),
              isCorrect: option.isCorrect
            })) ?? [],
          trueFalseStatements: [],
          numericAnswer: null,
          essayAnswer: null
        }
      }

      if (item.itemType === AssessmentItemType.true_false) {
        const answers = submission.tfAnswers.filter((entry) => entry.itemId === item.id)
        const pointEarned = answers
          .reduce((total, answer) => total + Number(answer.pointEarned), 0)
          .toString()
        return {
          id: item.id,
          questionNumber,
          itemType: item.itemType,
          maxScore: maxItemScore,
          pointEarned,
          outcome: getOutcome({
            hasAnswer: answers.length > 0,
            pointEarned,
            maxScore: maxItemScore
          }),
          content: item.question?.content ?? null,
          explanation: getExplanation(item),
          options: [],
          trueFalseStatements:
            item.question?.options.map((option) => {
              const answer = answers.find((entry) => entry.optionId === option.id)
              return {
                id: option.id,
                content: option.content,
                orderIndex: option.orderIndex,
                selectedValue: answer?.selectedValue ?? null,
                correctValue: option.isCorrect,
                isCorrect: answer?.isCorrect ?? null
              }
            }) ?? [],
          numericAnswer: null,
          essayAnswer: null
        }
      }

      if (item.itemType === AssessmentItemType.numeric) {
        const answer = submission.numericAnswers.find((entry) => entry.itemId === item.id)
        const pointEarned = answer?.pointEarned.toString() ?? '0'
        return {
          id: item.id,
          questionNumber,
          itemType: item.itemType,
          maxScore: maxItemScore,
          pointEarned,
          outcome: getOutcome({
            hasAnswer: Boolean(answer),
            pointEarned,
            maxScore: maxItemScore
          }),
          content: item.question?.content ?? null,
          explanation: getExplanation(item),
          options: [],
          trueFalseStatements: [],
          numericAnswer: {
            submittedValue: answer?.answerValue.toString() ?? null,
            correctValue: getNumericCorrectValue(item.correctAnswer)
          },
          essayAnswer: null
        }
      }

      const answer = submission.essayAnswers.find((entry) => entry.itemId === item.id)
      const pointEarned = answer?.teacherScore?.toString() ?? '0'
      return {
        id: item.id,
        questionNumber,
        itemType: item.itemType,
        maxScore: maxItemScore,
        pointEarned,
        outcome: getOutcome({
          hasAnswer: Boolean(answer?.answer.trim()),
          pointEarned,
          maxScore: maxItemScore
        }),
        content: item.question?.content ?? null,
        explanation: getExplanation(item),
        options: [],
        trueFalseStatements: [],
        numericAnswer: null,
        essayAnswer: {
          answer: answer?.answer ?? '',
          teacherScore: answer?.teacherScore?.toString() ?? null,
          teacherNote: answer?.teacherNote ?? null
        }
      }
    })
  }))
  const items = sections.flatMap((section) => section.items)

  return {
    ...base,
    summary: {
      totalItems: items.length,
      correctItems: items.filter((item) => item.outcome === 'correct').length,
      partialItems: items.filter((item) => item.outcome === 'partial').length,
      incorrectItems: items.filter((item) => item.outcome === 'incorrect').length,
      unansweredItems: items.filter((item) => item.outcome === 'unanswered').length
    },
    sections
  }
}
