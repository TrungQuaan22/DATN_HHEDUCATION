import type { Subject, AssessmentPlacement, Assessment } from '@prisma/client'
import type {
  RuntimePlacement,
  RuntimePreviewPlacement,
  RuntimePreviewPlacementForStudent
} from '../types'

export interface PublicAssessmentRepositoryPort {
  listPublicPlacements(data: {
    subject?: Subject
    grade?: number
    skip: number
    take: number
  }): Promise<[Array<AssessmentPlacement & { assessment: Assessment }>, number]>

  findRuntimePreviewPlacementById(placementId: string): Promise<RuntimePreviewPlacement | null>

  findRuntimePreviewPlacementByIdForStudent(placementId: string, userId: string): Promise<RuntimePreviewPlacementForStudent | null>

  findRuntimePlacementBySlug(slug: string): Promise<RuntimePlacement | null>

  findRuntimePreviewPlacementBySlug(slug: string): Promise<RuntimePreviewPlacement | null>
}
