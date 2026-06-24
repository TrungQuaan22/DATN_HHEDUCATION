import {
  type LessonMaterialProcessingStatus,
  type LessonMaterialType,
  type Prisma
} from '@prisma/client'

import { prisma } from '~/config/db'

import type {
  AdminLessonMaterialRecord,
  AdminLessonMaterialRepositoryPort,
  AdminLessonMaterialWithLessonRecord
} from '../ports/admin-lesson-material-repository.port'

const LESSON_MATERIAL_INCLUDE = {
  media: {
    select: {
      id: true,
      objectKey: true,
      originalName: true,
      mimeType: true,
      sizeBytes: true,
      status: true
    }
  }
} satisfies Prisma.LessonMaterialInclude

const LESSON_MATERIAL_WITH_LESSON_INCLUDE = {
  ...LESSON_MATERIAL_INCLUDE,
  lesson: {
    select: {
      id: true,
      chapter: {
        select: {
          id: true,
          courseId: true,
          title: true,
          orderIndex: true,
          createdAt: true,
          updatedAt: true,
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              teacherId: true,
              status: true,
              price: true,
              salePrice: true,
              deletedAt: true
            }
          }
        }
      }
    }
  }
} satisfies Prisma.LessonMaterialInclude

type PrismaLessonMaterial = Prisma.LessonMaterialGetPayload<{
  include: typeof LESSON_MATERIAL_INCLUDE
}>

type PrismaLessonMaterialWithLesson = Prisma.LessonMaterialGetPayload<{
  include: typeof LESSON_MATERIAL_WITH_LESSON_INCLUDE
}>

function mapToMaterialRecord(material: PrismaLessonMaterial): AdminLessonMaterialRecord {
  return {
    id: material.id,
    courseId: material.courseId,
    lessonId: material.lessonId,
    mediaId: material.mediaId,
    createdById: material.createdById,
    title: material.title,
    type: material.type,
    objectKey: material.objectKey,
    contentText: material.contentText,
    extractedText: material.extractedText,
    processingStatus: material.processingStatus,
    processingError: material.processingError,
    isPublic: material.isPublic,
    createdAt: material.createdAt,
    updatedAt: material.updatedAt,
    media: material.media
      ? {
          id: material.media.id,
          objectKey: material.media.objectKey,
          originalName: material.media.originalName,
          mimeType: material.media.mimeType,
          sizeBytes: material.media.sizeBytes,
          status: material.media.status
        }
      : null
  }
}

function mapToMaterialWithLessonRecord(
  material: PrismaLessonMaterialWithLesson
): AdminLessonMaterialWithLessonRecord {
  return {
    ...mapToMaterialRecord(material),
    lesson: {
      id: material.lesson.id,
      chapter: {
        id: material.lesson.chapter.id,
        courseId: material.lesson.chapter.courseId,
        title: material.lesson.chapter.title,
        orderIndex: material.lesson.chapter.orderIndex,
        createdAt: material.lesson.chapter.createdAt,
        updatedAt: material.lesson.chapter.updatedAt,
        course: {
          id: material.lesson.chapter.course.id,
          title: material.lesson.chapter.course.title,
          slug: material.lesson.chapter.course.slug,
          teacherId: material.lesson.chapter.course.teacherId,
          status: material.lesson.chapter.course.status,
          price: Number(material.lesson.chapter.course.price),
          salePrice:
            material.lesson.chapter.course.salePrice === null
              ? null
              : Number(material.lesson.chapter.course.salePrice),
          deletedAt: material.lesson.chapter.course.deletedAt
        }
      }
    }
  }
}

export class PrismaAdminLessonMaterialRepository implements AdminLessonMaterialRepositoryPort {
  async listLessonMaterials(lessonId: string): Promise<AdminLessonMaterialRecord[]> {
    const materials = await prisma.lessonMaterial.findMany({
      where: {
        lessonId,
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: LESSON_MATERIAL_INCLUDE
    })

    return materials.map(mapToMaterialRecord)
  }

  async findMaterialById(
    materialId: string
  ): Promise<AdminLessonMaterialWithLessonRecord | null> {
    const material = await prisma.lessonMaterial.findFirst({
      where: {
        id: materialId,
        deletedAt: null
      },
      include: LESSON_MATERIAL_WITH_LESSON_INCLUDE
    })

    return material ? mapToMaterialWithLessonRecord(material) : null
  }

  async createLessonMaterial(data: {
    courseId: string
    lessonId: string
    mediaId?: string | null
    createdById?: string | null
    title: string
    type: LessonMaterialType
    objectKey?: string | null
    contentText?: string | null
    isPublic: boolean
  }): Promise<AdminLessonMaterialRecord> {
    const material = await prisma.lessonMaterial.create({
      data: {
        courseId: data.courseId,
        lessonId: data.lessonId,
        mediaId: data.mediaId ?? null,
        createdById: data.createdById ?? null,
        title: data.title,
        type: data.type,
        objectKey: data.objectKey ?? null,
        contentText: data.contentText ?? null,
        isPublic: data.isPublic
      },
      include: LESSON_MATERIAL_INCLUDE
    })

    return mapToMaterialRecord(material)
  }

  async updateLessonMaterial(data: {
    materialId: string
    mediaId?: string | null
    title?: string
    objectKey?: string | null
    contentText?: string | null
    isPublic?: boolean
    processingStatus?: LessonMaterialProcessingStatus
    processingError?: string | null
  }): Promise<AdminLessonMaterialRecord> {
    const material = await prisma.lessonMaterial.update({
      where: {
        id: data.materialId
      },
      data: {
        mediaId: data.mediaId,
        title: data.title,
        objectKey: data.objectKey,
        contentText: data.contentText,
        isPublic: data.isPublic,
        processingStatus: data.processingStatus,
        processingError: data.processingError
      },
      include: LESSON_MATERIAL_INCLUDE
    })

    return mapToMaterialRecord(material)
  }

  async softDeleteLessonMaterial(materialId: string): Promise<AdminLessonMaterialRecord> {
    const material = await prisma.lessonMaterial.update({
      where: {
        id: materialId
      },
      data: {
        deletedAt: new Date()
      },
      include: LESSON_MATERIAL_INCLUDE
    })

    return mapToMaterialRecord(material)
  }
}

export const adminLessonMaterialRepository = new PrismaAdminLessonMaterialRepository()
