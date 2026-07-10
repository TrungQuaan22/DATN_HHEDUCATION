import {
  AssessmentPlacementType,
  AssessmentVisibility,
  Prisma,
  Subject,
  AssessmentPlacement,
  Assessment
} from '@prisma/client'

import { prisma } from '~/config/db'

import type { PublicAssessmentRepositoryPort } from '../ports/public-assessment-repository.port'
import {
  runtimeAssessmentInclude,
  runtimeAssessmentPreviewInclude
} from './shared'
import type {
  RuntimePlacement,
  RuntimePreviewPlacement,
  RuntimePreviewPlacementForStudent
} from '../types'

export class PrismaPublicAssessmentRepository implements PublicAssessmentRepositoryPort {
  // Liệt kê các placement public practice đã publish.
  listPublicPlacements(data: {
    subject?: Subject
    grade?: number
    page: number
    limit: number
  }): Promise<[Array<AssessmentPlacement & { assessment: Assessment }>, number]> {
    const where: Prisma.AssessmentPlacementWhereInput = {
      type: AssessmentPlacementType.public_practice,
      assessment: {
        visibility: AssessmentVisibility.published,
        deletedAt: null,
        subject: data.subject,
        grade: data.grade
      }
    }

    return prisma.$transaction([
      prisma.assessmentPlacement.findMany({
        where,
        skip: (data.page - 1) * data.limit,
        take: data.limit,
        orderBy: [{ isFeatured: 'desc' }, { orderIndex: 'asc' }, { createdAt: 'desc' }],
        include: {
          assessment: true
        }
      }),
      prisma.assessmentPlacement.count({ where })
    ])
  }

  // Lấy preview placement public/course/lesson theo id.
  findRuntimePreviewPlacementById(placementId: string): Promise<RuntimePreviewPlacement | null> {
    return prisma.assessmentPlacement.findFirst({
      where: {
        id: placementId,
        assessment: {
          visibility: AssessmentVisibility.published,
          deletedAt: null
        }
      },
      include: runtimeAssessmentPreviewInclude
    })
  }

  // Lấy preview placement theo id kèm submission của học sinh.
  findRuntimePreviewPlacementByIdForStudent(placementId: string, userId: string): Promise<RuntimePreviewPlacementForStudent | null> {
    return prisma.assessmentPlacement.findFirst({
      where: {
        id: placementId,
        assessment: {
          visibility: AssessmentVisibility.published,
          deletedAt: null
        }
      },
      include: {
        ...runtimeAssessmentPreviewInclude,
        submissions: {
          where: {
            studentId: userId
          },
          orderBy: {
            attemptNumber: 'desc'
          },
          select: {
            id: true,
            assessmentId: true,
            placementId: true,
            attemptNumber: true,
            status: true,
            startTime: true,
            submitTime: true,
            autoScore: true,
            finalScore: true
          }
        }
      }
    })
  }

  // Lấy workspace đầy đủ của public practice theo slug.
  findRuntimePlacementBySlug(slug: string): Promise<RuntimePlacement | null> {
    return prisma.assessmentPlacement.findFirst({
      where: {
        slug,
        type: AssessmentPlacementType.public_practice,
        assessment: {
          visibility: AssessmentVisibility.published,
          deletedAt: null
        }
      },
      include: runtimeAssessmentInclude
    })
  }

  // Lấy preview public practice theo slug.
  findRuntimePreviewPlacementBySlug(slug: string): Promise<RuntimePreviewPlacement | null> {
    return prisma.assessmentPlacement.findFirst({
      where: {
        slug,
        type: AssessmentPlacementType.public_practice,
        assessment: {
          visibility: AssessmentVisibility.published,
          deletedAt: null
        }
      },
      include: runtimeAssessmentPreviewInclude
    })
  }
}
