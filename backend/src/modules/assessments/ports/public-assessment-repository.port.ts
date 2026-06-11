import type { Subject } from '@prisma/client'

export interface PublicAssessmentRepositoryPort {
  listPublicPlacements(data: {
    subject?: Subject
    grade?: number
    skip: number
    take: number
  }): Promise<[any[], number]>

  findRuntimePreviewPlacementById(placementId: string): Promise<any>

  findRuntimePreviewPlacementByIdForStudent(placementId: string, userId: string): Promise<any>

  findRuntimePlacementBySlug(slug: string): Promise<any>

  findRuntimePreviewPlacementBySlug(slug: string): Promise<any>
}
