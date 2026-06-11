import {
  AssessmentPlacementType,
  AssessmentVisibility,
  Prisma,
  Subject
} from '@prisma/client'

import { prisma } from '~/config/db'

import type { PublicAssessmentRepositoryPort } from '../ports/public-assessment-repository.port'
import {
  runtimeAssessmentInclude,
  runtimeAssessmentPreviewInclude
} from './shared'

export class PrismaPublicAssessmentRepository implements PublicAssessmentRepositoryPort {
  listPublicPlacements(data: {
    subject?: Subject
    grade?: number
    skip: number
    take: number
  }) {
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
        skip: data.skip,
        take: data.take,
        orderBy: [{ isFeatured: 'desc' }, { orderIndex: 'asc' }, { createdAt: 'desc' }],
        include: {
          assessment: true
        }
      }),
      prisma.assessmentPlacement.count({ where })
    ])
  }

  findRuntimePreviewPlacementById(placementId: string) {
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

  findRuntimePreviewPlacementByIdForStudent(placementId: string, userId: string) {
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

  findRuntimePlacementBySlug(slug: string) {
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

  findRuntimePreviewPlacementBySlug(slug: string) {
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
