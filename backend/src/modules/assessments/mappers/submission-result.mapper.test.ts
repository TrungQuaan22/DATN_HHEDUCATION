import assert from 'node:assert/strict'
import test from 'node:test'
import {
  AssessmentItemType,
  AssessmentType,
  GradingType,
  Prisma,
  QuestionDifficulty,
  QuestionSource,
  QuestionStatus,
  QuestionType,
  SubmissionStatus,
  Subject
} from '@prisma/client'

import type { StudentSubmissionComplete } from '../types'
import { mapStudentSubmissionResult } from './submission-result.mapper'

const submissionId = '00000000-0000-0000-0000-000000000001'
const assessmentId = '00000000-0000-0000-0000-000000000002'
const itemId = '00000000-0000-0000-0000-000000000003'
const correctOptionId = '00000000-0000-0000-0000-000000000004'
const wrongOptionId = '00000000-0000-0000-0000-000000000005'

function createSubmission(
  status: SubmissionStatus,
  finalScore: Prisma.Decimal | null
): StudentSubmissionComplete {
  return {
    id: submissionId,
    assessmentId,
    placementId: '00000000-0000-0000-0000-000000000006',
    studentId: '00000000-0000-0000-0000-000000000007',
    attemptNumber: 1,
    startTime: new Date('2026-06-01T00:00:00.000Z'),
    submitTime: new Date('2026-06-01T00:30:00.000Z'),
    status,
    version: 1,
    autoScore: new Prisma.Decimal(0),
    finalScore,
    violationCount: 0,
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-01T00:30:00.000Z'),
    mcqAnswers: [
      {
        id: '00000000-0000-0000-0000-000000000008',
        submissionId,
        itemId,
        isCorrect: false,
        pointEarned: new Prisma.Decimal(0),
        selectedOptions: [
          {
            id: '00000000-0000-0000-0000-000000000009',
            answerId: '00000000-0000-0000-0000-000000000008',
            optionId: wrongOptionId
          }
        ]
      }
    ],
    tfAnswers: [],
    numericAnswers: [],
    essayAnswers: [],
    assessment: {
      id: assessmentId,
      subject: Subject.math,
      grade: 12,
      type: AssessmentType.exam,
      title: 'Đề kiểm tra học kỳ',
      gradingType: GradingType.auto,
      timeLimitMinutes: 45,
      visibility: 'published',
      sourceMediaId: null,
      sourceMetadata: null,
      createdById: null,
      publishedAt: new Date('2026-05-01T00:00:00.000Z'),
      hiddenAt: null,
      createdAt: new Date('2026-05-01T00:00:00.000Z'),
      updatedAt: new Date('2026-05-01T00:00:00.000Z'),
      deletedAt: null,
      sourceMedia: null,
      sections: [
        {
          id: '00000000-0000-0000-0000-000000000010',
          assessmentId,
          title: 'Phần trắc nghiệm',
          description: null,
          itemType: AssessmentItemType.mcq,
          orderIndex: 1,
          createdAt: new Date('2026-05-01T00:00:00.000Z'),
          updatedAt: new Date('2026-05-01T00:00:00.000Z'),
          items: [
            {
              id: itemId,
              assessmentId,
              sectionId: '00000000-0000-0000-0000-000000000010',
              itemType: AssessmentItemType.mcq,
              questionId: '00000000-0000-0000-0000-000000000011',
              topicId: null,
              difficulty: null,
              orderIndex: 1,
              correctAnswer: null,
              explanation: 'Vì đáp án A thỏa mãn điều kiện của đề bài.',
              scoringConfig: null,
              maxScore: new Prisma.Decimal(1),
              question: {
                id: '00000000-0000-0000-0000-000000000011',
                topicId: null,
                difficulty: QuestionDifficulty.recognition,
                type: QuestionType.mcq,
                source: QuestionSource.bank,
                sourceRef: null,
                content: 'Chọn đáp án đúng.',
                explanation: null,
                status: QuestionStatus.active,
                createdAt: new Date('2026-05-01T00:00:00.000Z'),
                updatedAt: new Date('2026-05-01T00:00:00.000Z'),
                deletedAt: null,
                options: [
                  {
                    id: correctOptionId,
                    questionId: '00000000-0000-0000-0000-000000000011',
                    content: 'Đáp án A',
                    isCorrect: true,
                    orderIndex: 1
                  },
                  {
                    id: wrongOptionId,
                    questionId: '00000000-0000-0000-0000-000000000011',
                    content: 'Đáp án B',
                    isCorrect: false,
                    orderIndex: 2
                  }
                ]
              }
            }
          ]
        }
      ]
    },
    placement: null,
    student: {
      id: '00000000-0000-0000-0000-000000000007',
      fullName: 'Nguyễn Văn An',
      email: 'an@example.com'
    }
  }
}

test('shows the answer key and explanation only after the result is finalized', () => {
  const result = mapStudentSubmissionResult(
    createSubmission(SubmissionStatus.completed, new Prisma.Decimal(0))
  )

  assert.equal(result.reviewAvailable, true)
  assert.equal(result.sections[0].items[0].outcome, 'incorrect')
  assert.equal(
    result.sections[0].items[0].explanation,
    'Vì đáp án A thỏa mãn điều kiện của đề bài.'
  )
  assert.deepEqual(
    result.sections[0].items[0].options.map((option) => ({
      id: option.id,
      isSelected: option.isSelected,
      isCorrect: option.isCorrect
    })),
    [
      { id: correctOptionId, isSelected: false, isCorrect: true },
      { id: wrongOptionId, isSelected: true, isCorrect: false }
    ]
  )
})

test('does not leak questions or answer keys while manual grading is pending', () => {
  const result = mapStudentSubmissionResult(createSubmission(SubmissionStatus.submitted, null))

  assert.equal(result.reviewAvailable, false)
  assert.equal(result.assessment.sourceMediaUrl, null)
  assert.equal(result.summary, null)
  assert.deepEqual(result.sections, [])
})
