import {
  AssessmentItemType,
  AssessmentPlacementType,
  AssessmentVisibility,
  SubmissionStatus
} from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

import type {
  ListStudentAssessmentsDto,
  SaveAnswerDto
} from '../dto'
import {
  mapRuntimePlacement
} from '../mappers/assessment.mapper'
import {
  addScores,
  multiplyScore,
  scoresAreEqual,
  zeroScore
} from '../helpers/score.helper'
import { Submission } from '../entities/submission.entity'
import type { StudentAssessmentRepositoryPort } from '../ports/student-assessment-repository.port'
import {
  ensureSubmissionForStudentExists,
  ensurePlacementAccess,
  ensurePlacementAvailable,
  ensureSubmissionAccess
} from '../ensures/assessment.ensure'
import type { SubmissionDetail, StudentPlacementListItem, StudentSubmissionComplete } from '../types'

const ensureSubmissionIsDoing = (status: SubmissionStatus) => {
  if (status !== SubmissionStatus.doing) {
    throw new AppError(409, ERROR_CODE.CONFLICT, 'Submission is already submitted')
  }
}

const calculateTimeRemainingSeconds = (data: {
  startTime: Date
  timeLimitMinutes: number | null
  closeTime: Date | null
}) => {
  const deadlines = []

  if (data.timeLimitMinutes !== null) {
    deadlines.push(data.startTime.getTime() + data.timeLimitMinutes * 60 * 1000)
  }

  if (data.closeTime) {
    deadlines.push(data.closeTime.getTime())
  }

  if (deadlines.length === 0) {
    return null
  }

  const remainingMs = Math.min(...deadlines) - Date.now()
  return Math.max(0, Math.floor(remainingMs / 1000))
}

const getQuestionOptions = (item: {
  question: {
    options: Array<{ id: string; isCorrect?: boolean }>
  } | null
}) => item.question?.options ?? []

const flattenSections = <TItem>(sections: Array<{ items: TItem[] }>): TItem[] =>
  sections.flatMap((section) => section.items)

const mapSubmissionForRuntime = (submission: SubmissionDetail) => ({
  id: submission.id,
  assessmentId: submission.assessmentId,
  placementId: submission.placementId,
  attemptNumber: submission.attemptNumber,
  status: submission.status,
  startTime: submission.startTime,
  submitTime: submission.submitTime,
  autoScore: submission.autoScore?.toString() ?? null,
  finalScore: submission.finalScore?.toString() ?? null,
  answers: {
    mcq: (submission.mcqAnswers ?? []).map((answer) => ({
      itemId: answer.itemId,
      selectedOptionIds: answer.selectedOptions.map((option) => option.optionId)
    })),
    trueFalse: (submission.tfAnswers ?? []).map((answer) => ({
      itemId: answer.itemId,
      optionId: answer.optionId,
      selectedValue: answer.selectedValue
    })),
    numeric: (submission.numericAnswers ?? []).map((answer) => ({
      itemId: answer.itemId,
      answerValue: answer.answerValue.toString()
    })),
    essay: (submission.essayAnswers ?? []).map((answer) => ({
      itemId: answer.itemId,
      answer: answer.answer
    }))
  }
})

export class StudentAssessmentService {
  constructor(private readonly repository: StudentAssessmentRepositoryPort) {}

  async listStudentAssessments(data: ListStudentAssessmentsDto & { userId: string }) {
    const [placements, totalItems] = await this.repository.listStudentAssessmentPlacements({
      userId: data.userId,
      subject: data.subject,
      grade: data.grade,
      status: data.status,
      skip: (data.page - 1) * data.limit,
      take: data.limit
    })

    return {
      items: placements.map((placement: StudentPlacementListItem) => {
        const latestSubmission = placement.submissions[0] ?? null
        const course = placement.course ?? placement.lesson?.chapter.course ?? null

        return {
          placementId: placement.id,
          placementType: placement.type,
          assessmentId: placement.assessmentId,
          title: placement.assessment.title,
          subject: placement.assessment.subject,
          grade: placement.assessment.grade,
          assessmentType: placement.assessment.type,
          gradingType: placement.assessment.gradingType,
          timeLimitMinutes: placement.assessment.timeLimitMinutes,
          maxAttempts: placement.maxAttempts,
          openTime: placement.openTime,
          closeTime: placement.closeTime,
          course,
          lesson: placement.lesson
            ? {
                id: placement.lesson.id,
                title: placement.lesson.title,
                chapterTitle: placement.lesson.chapter.title
              }
            : null,
          attempt: {
            usedAttempts: placement.submissions.length,
            latestSubmission: latestSubmission
              ? {
                  id: latestSubmission.id,
                  assessmentId: latestSubmission.assessmentId,
                  placementId: latestSubmission.placementId,
                  attemptNumber: latestSubmission.attemptNumber,
                  status: latestSubmission.status,
                  startTime: latestSubmission.startTime,
                  submitTime: latestSubmission.submitTime,
                  autoScore: latestSubmission.autoScore?.toString() ?? null,
                  finalScore: latestSubmission.finalScore?.toString() ?? null
                }
              : null
          }
        }
      }),
      pagination: {
        page: data.page,
        limit: data.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / data.limit)
      }
    }
  }

  async getAssessmentWorkspace(data: {
    userId: string
    placementId: string
    submissionId: string
  }) {
    const submission = await this.repository.findSubmissionWorkspaceGate(data)

    if (!submission || !submission.placement) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'Invalid active assessment attempt')
    }

    if (
      submission.status !== SubmissionStatus.doing ||
      submission.placement.assessment.visibility !== AssessmentVisibility.published ||
      submission.placement.assessment.deletedAt !== null
    ) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'Assessment attempt is not active')
    }

    ensurePlacementAvailable(submission.placement)

    const timeRemainingSeconds = calculateTimeRemainingSeconds({
      startTime: submission.startTime,
      timeLimitMinutes: submission.placement.assessment.timeLimitMinutes,
      closeTime: submission.placement.closeTime
    })

    if (timeRemainingSeconds !== null && timeRemainingSeconds <= 0) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'Assessment time limit exceeded')
    }

    const placement = await this.repository.findRuntimePlacementById(data.placementId)
    const submissionRecord = await this.repository.findSubmissionForStudent(
      data.submissionId,
      data.userId
    )
    const activeSubmission = ensureSubmissionForStudentExists(submissionRecord)

    if (!placement) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment placement not found')
    }

    const runtime = mapRuntimePlacement(placement)
    const { type: placementType, ...workspace } = runtime
    void placementType

    return {
      ...workspace,
      submissionId: submission.id,
      submission: mapSubmissionForRuntime(activeSubmission),
      timeRemainingSeconds
    }
  }

  async startAttempt(data: { userId: string; placementId: string }) {
    const placement = await this.repository.findRuntimePreviewPlacementById(data.placementId)

    if (!placement) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment placement not found')
    }

    const enrollment = data.userId
      ? placement.type === AssessmentPlacementType.course
        ? await this.repository.findEnrollmentForPlacement(data.userId, placement.id)
        : await this.repository.findEnrollmentForLessonPlacement(data.userId, placement.id)
      : null
    ensurePlacementAccess(data.userId, placement, enrollment)
    ensurePlacementAvailable(placement)

    const doingSubmission = await this.repository.findDoingSubmissionForPlacement(data.userId, placement.id)

    if (doingSubmission) {
      return mapSubmissionForRuntime(doingSubmission)
    }

    const attemptCount = await this.repository.countAttempts(data.userId, placement.id)

    if (placement.maxAttempts !== null && attemptCount >= placement.maxAttempts) {
      throw new AppError(409, ERROR_CODE.CONFLICT, 'Maximum attempts reached')
    }

    const submission = await this.repository.createSubmission({
      userId: data.userId,
      assessmentId: placement.assessmentId,
      placementId: placement.id,
      attemptNumber: attemptCount + 1
    })

    return mapSubmissionForRuntime(submission)
  }

  async saveAnswers(data: { userId: string; submissionId: string; answers: SaveAnswerDto[] }) {
    const submissionRecord = await this.repository.findSubmissionForStudent(
      data.submissionId,
      data.userId
    )
    const submission = ensureSubmissionForStudentExists(submissionRecord)

    ensureSubmissionIsDoing(submission.status)

    const enrollment = submission.placement
      ? submission.placement.type === AssessmentPlacementType.course
        ? await this.repository.findEnrollmentForPlacement(data.userId, submission.placement.id)
        : await this.repository.findEnrollmentForLessonPlacement(data.userId, submission.placement.id)
      : null
    ensureSubmissionAccess(data.userId, submission, enrollment)
    this.ensureAnswersBelongToAssessment(data.answers, flattenSections(submission.assessment.sections))

    await this.repository.saveAnswers(data.submissionId, data.answers)
    return { submissionId: data.submissionId, saved: true }
  }

  async submitAttempt(data: { userId: string; submissionId: string }) {
    const submissionRecord = await this.repository.findSubmissionForStudent(
      data.submissionId,
      data.userId
    )
    const submission = ensureSubmissionForStudentExists(submissionRecord)

    ensureSubmissionIsDoing(submission.status)

    const enrollment = submission.placement
      ? submission.placement.type === AssessmentPlacementType.course
        ? await this.repository.findEnrollmentForPlacement(data.userId, submission.placement.id)
        : await this.repository.findEnrollmentForLessonPlacement(data.userId, submission.placement.id)
      : null
    ensureSubmissionAccess(data.userId, submission, enrollment)

    const grading = this.calculateObjectiveScore(submission)
    const hasEssay = flattenSections(submission.assessment.sections).some((item) => item.itemType === AssessmentItemType.essay)
    const status = hasEssay ? SubmissionStatus.submitted : SubmissionStatus.completed
    const finalScore = hasEssay ? null : grading.autoScore

    const updatedSubmission = await this.repository.updateAutoGrading({
      submissionId: submission.id,
      mcqResults: grading.mcqResults,
      tfResults: grading.tfResults,
      numericResults: grading.numericResults,
      autoScore: grading.autoScore,
      status,
      finalScore
    })

    return mapSubmissionForRuntime(updatedSubmission)
  }

  private ensureAnswersBelongToAssessment(
    answers: SaveAnswerDto[],
    items: Array<{
      id: string
      itemType: AssessmentItemType
      scoringConfig: unknown
      question: { options: Array<{ id: string }> } | null
    }>
  ) {
    const itemById = new Map(items.map((item) => [item.id, item]))

    for (const answer of answers) {
      const item = itemById.get(answer.itemId)

      if (!item || item.itemType !== answer.type) {
        throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Answer item does not belong to assessment')
      }

      const optionIds = new Set(getQuestionOptions(item).map((option) => option.id))

      if (answer.type === AssessmentItemType.mcq) {
        const selectedOptionIds = new Set(answer.selectedOptionIds)

        if (selectedOptionIds.size !== answer.selectedOptionIds.length) {
          throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'MCQ selected options must be unique')
        }

        if (!answer.selectedOptionIds.every((optionId) => optionIds.has(optionId))) {
          throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'MCQ selected option is invalid')
        }

        const scoringConfig = item.scoringConfig as { mode?: string } | null
        const isMultiple = scoringConfig?.mode === 'multiple'

        if (!isMultiple && answer.selectedOptionIds.length !== 1) {
          throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Single-answer MCQ requires exactly one selected option')
        }
      }

      if (answer.type === AssessmentItemType.true_false) {
        const selectedOptionIds = new Set(answer.selections.map((selection) => selection.optionId))

        if (selectedOptionIds.size !== answer.selections.length) {
          throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'True/False selections must be unique by statement')
        }

        if (!answer.selections.every((selection) => optionIds.has(selection.optionId))) {
          throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'True/False selected option is invalid')
        }
      }
    }
  }

  private calculateObjectiveScore(submission: StudentSubmissionComplete) {
    if (!submission) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Submission not found')
    }

    const mcqResults: Array<{ answerId: string; isCorrect: boolean; pointEarned: string }> = []
    const tfResults: Array<{ answerId: string; isCorrect: boolean; pointEarned: string }> = []
    const numericResults: Array<{ answerId: string; isCorrect: boolean; pointEarned: string }> = []
    let autoScore = zeroScore()

    const items = flattenSections(submission.assessment.sections)

    for (const item of items) {
      if (item.itemType === AssessmentItemType.mcq) {
        const answer = submission.mcqAnswers.find((mcqAnswer) => mcqAnswer.itemId === item.id)
        const selectedOptionIds = answer?.selectedOptions.map((option) => option.optionId) ?? []
        const correctOptionIds = getQuestionOptions(item)
          .filter((option) => option.isCorrect)
          .map((option) => option.id)
        const submissionEntity = new Submission({ id: submission.id })
        const isCorrect = submissionEntity.isSameSet(selectedOptionIds, correctOptionIds)
        const pointEarned = isCorrect ? item.maxScore.toString() : zeroScore()

        if (answer) {
          mcqResults.push({ answerId: answer.id, isCorrect, pointEarned })
        }

        autoScore = addScores(autoScore, pointEarned)
      }

      if (item.itemType === AssessmentItemType.true_false) {
        const options = getQuestionOptions(item)
        const answers = submission.tfAnswers.filter((tfAnswer) => tfAnswer.itemId === item.id)
        let correctCount = 0

        for (const option of options) {
          const answer = answers.find((tfAnswer) => tfAnswer.optionId === option.id)
          const isCorrect = Boolean(answer && answer.selectedValue === option.isCorrect)

          if (isCorrect) {
            correctCount += 1
          }

          if (answer) {
            tfResults.push({ answerId: answer.id, isCorrect, pointEarned: zeroScore() })
          }
        }

        const submissionEntity = new Submission({ id: submission.id })
        const pointEarned = multiplyScore(
          item.maxScore,
          submissionEntity.calculateTrueFalseRatio(correctCount, options.length)
        )
        const firstAnswer = answers[0]

        if (firstAnswer) {
          const firstResult = tfResults.find((result) => result.answerId === firstAnswer.id)

          if (firstResult) {
            firstResult.pointEarned = pointEarned
          }
        }

        autoScore = addScores(autoScore, pointEarned)
      }

      if (item.itemType === AssessmentItemType.numeric) {
        const answer = submission.numericAnswers.find((numericAnswer) => numericAnswer.itemId === item.id)
        const correctAnswer = item.correctAnswer as { value?: number } | null
        const isCorrect = Boolean(
          answer &&
            correctAnswer?.value !== undefined &&
            scoresAreEqual(answer.answerValue, correctAnswer.value)
        )
        const pointEarned = isCorrect ? item.maxScore.toString() : zeroScore()

        if (answer) {
          numericResults.push({ answerId: answer.id, isCorrect, pointEarned })
        }

        autoScore = addScores(autoScore, pointEarned)
      }
    }

    return {
      mcqResults,
      tfResults,
      numericResults,
      autoScore
    }
  }
}
