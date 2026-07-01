import { UserRole, type AssessmentPlacementType } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

export type AssessmentActor = {
  id: string
  role: UserRole
}

export type PlacementAccess = {
  type: AssessmentPlacementType
  course?: { teacherId: string } | null
  lesson?: { chapter?: { course?: { teacherId: string } | null } | null } | null
}

const isTeacherPlacement = (actor: AssessmentActor, placement: PlacementAccess): boolean => {
  if (actor.role !== UserRole.teacher) {
    return false
  }

  return (
    placement.course?.teacherId === actor.id ||
    placement.lesson?.chapter?.course?.teacherId === actor.id
  )
}

export function canManageAssessment(
  createdById: string | null | undefined,
  actor: AssessmentActor
): boolean {
  return actor.role === UserRole.admin || createdById === actor.id
}

export function validateCanManageAssessment(
  assessment: { createdById?: string | null },
  actor: AssessmentActor
): void {
  if (!canManageAssessment(assessment.createdById, actor)) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only manage assessments you created')
  }
}

export function validateCanViewAssessment(
  assessment: { createdById?: string | null },
  actor: AssessmentActor,
  placements: PlacementAccess[] = []
): void {
  const canView =
    canManageAssessment(assessment.createdById, actor) ||
    placements.some((placement) => isTeacherPlacement(actor, placement))

  if (!canView) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You cannot view this assessment')
  }
}

export function validateCanManagePlacement(
  assessment: { createdById?: string | null },
  actor: AssessmentActor,
  placements: PlacementAccess[] = []
): void {
  const canManage =
    canManageAssessment(assessment.createdById, actor) ||
    placements.some((placement) => isTeacherPlacement(actor, placement))

  if (!canManage) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You cannot manage this assessment placement')
  }
}

export function validateCanGradeAssessment(
  assessment: { createdById?: string | null },
  actor: AssessmentActor,
  placement?: PlacementAccess | null
): void {
  const canGrade =
    canManageAssessment(assessment.createdById, actor) ||
    Boolean(placement && isTeacherPlacement(actor, placement))

  if (!canGrade) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You cannot grade this submission')
  }
}
