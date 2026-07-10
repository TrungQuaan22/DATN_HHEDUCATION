import type { Subject, AssessmentPlacement, Assessment } from '@prisma/client'
import type {
  RuntimePlacement,
  RuntimePreviewPlacement,
  RuntimePreviewPlacementForStudent
} from '../types'

export interface PublicAssessmentRepositoryPort {
  // Liệt kê public practice placement.
  listPublicPlacements(data: {
    subject?: Subject
    grade?: number
    page: number
    limit: number
  }): Promise<[Array<AssessmentPlacement & { assessment: Assessment }>, number]>

  // Lấy preview placement theo id.
  findRuntimePreviewPlacementById(placementId: string): Promise<RuntimePreviewPlacement | null>

  // Lấy preview placement theo id kèm submission của học sinh.
  findRuntimePreviewPlacementByIdForStudent(placementId: string, userId: string): Promise<RuntimePreviewPlacementForStudent | null>

  // Lấy workspace public practice theo slug.
  findRuntimePlacementBySlug(slug: string): Promise<RuntimePlacement | null>

  // Lấy preview public practice theo slug.
  findRuntimePreviewPlacementBySlug(slug: string): Promise<RuntimePreviewPlacement | null>
}
