import { LessonMaterialType } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import { ensureMediaExists } from '~/common/ensures/media.ensure'
import { validateDocumentMedia } from '~/common/policies/media.policy'
import { aiServiceConfig } from '~/config/ai-service'
import { mediaRepository } from '~/modules/media/repository'
import { mediaStorage } from '~/modules/media/adapters/r2-media-storage.adapter'
import type { MediaRepositoryPort } from '~/modules/media/ports/media-repository.port'
import type { MediaStoragePort } from '~/modules/media/ports/media-storage.port'

import type {
  AdminLessonMaterialResponse,
  CreateLessonMaterialDto,
  DeleteLessonMaterialDto,
  IngestLessonMaterialDto,
  IngestLessonMaterialResponse,
  UpdateLessonMaterialDto
} from '../dto'
import { mapAdminLessonMaterialResponse } from '../mappers'
import type { AdminLessonMaterialRepositoryPort } from '../ports/admin-lesson-material-repository.port'
import type {
  AdminLessonRepositoryPort,
  AdminLessonWithChapterRecord
} from '../ports/admin-lesson-repository.port'
import {
  type CourseActor,
  validateCourseCanBeEdited,
  validateCourseCanManage
} from '../policies/course.policy'
import { adminLessonMaterialRepository, adminLessonRepository } from '../repositories'

const FILE_MATERIAL_TYPES = new Set<LessonMaterialType>([
  LessonMaterialType.pdf,
  LessonMaterialType.docx,
  LessonMaterialType.pptx
])

const isFileMaterialType = (type: LessonMaterialType): boolean => FILE_MATERIAL_TYPES.has(type)

export class AdminLessonMaterialService {
  constructor(
    private readonly materialRepository: AdminLessonMaterialRepositoryPort,
    private readonly lessonRepository: AdminLessonRepositoryPort,
    private readonly mediaRepository: MediaRepositoryPort,
    private readonly storage: MediaStoragePort
  ) {}

  private ensureLessonExists(
    lesson: AdminLessonWithChapterRecord | null
  ): AdminLessonWithChapterRecord {
    if (!lesson) {
      throw new AppError(404, ERROR_CODE.LESSON_NOT_FOUND, ERROR_MESSAGE.LESSON_NOT_FOUND)
    }

    return lesson
  }

  private ensureMaterialExists<T>(material: T | null): T {
    if (!material) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Lesson material not found')
    }

    return material
  }

  private validateCanManageCourse(
    actor: CourseActor,
    course: AdminLessonWithChapterRecord['chapter']['course']
  ): void {
    validateCourseCanManage(course, actor)
    validateCourseCanBeEdited(course)
  }

  private async resolveDocumentMedia(actor: CourseActor, mediaId: string) {
    const mediaRecord = await this.mediaRepository.findMediaById(mediaId)
    const media = ensureMediaExists(mediaRecord)

    validateDocumentMedia(actor, media, 'Lesson material media')

    return media
  }

  async listLessonMaterials(
    actor: CourseActor,
    lessonId: string
  ): Promise<AdminLessonMaterialResponse[]> {
    const lessonRecord = await this.lessonRepository.findLessonById(lessonId)
    const lesson = this.ensureLessonExists(lessonRecord)
    this.validateCanManageCourse(actor, lesson.chapter.course)

    const materials = await this.materialRepository.listLessonMaterials(lessonId)

    return materials.map(mapAdminLessonMaterialResponse)
  }

  async createLessonMaterial(
    actor: CourseActor,
    input: CreateLessonMaterialDto
  ): Promise<AdminLessonMaterialResponse> {
    const lessonRecord = await this.lessonRepository.findLessonById(input.lessonId)
    const lesson = this.ensureLessonExists(lessonRecord)
    this.validateCanManageCourse(actor, lesson.chapter.course)

    if (input.type === LessonMaterialType.text || input.type === LessonMaterialType.markdown) {
      const material = await this.materialRepository.createLessonMaterial({
        courseId: lesson.chapter.course.id,
        lessonId: input.lessonId,
        mediaId: null,
        createdById: actor.id,
        title: input.title,
        type: input.type,
        objectKey: null,
        contentText: input.contentText,
        isPublic: input.isPublic ?? true
      })

      this.ingestLessonMaterial(actor, { materialId: material.id }).catch((err) => {
        console.error(`Auto-ingestion failed for text material ${material.id}:`, err)
      })

      return mapAdminLessonMaterialResponse(material)
    }

    const media = await this.resolveDocumentMedia(actor, input.mediaId)
    const material = await this.materialRepository.createLessonMaterial({
      courseId: lesson.chapter.course.id,
      lessonId: input.lessonId,
      mediaId: media?.id ?? null,
      createdById: actor.id,
      title: input.title,
      type: input.type,
      objectKey: media?.objectKey ?? null,
      contentText: null,
      isPublic: input.isPublic ?? true
    })

    this.ingestLessonMaterial(actor, { materialId: material.id }).catch((err) => {
      console.error(`Auto-ingestion failed for file material ${material.id}:`, err)
    })

    return mapAdminLessonMaterialResponse(material)
  }

  async updateLessonMaterial(
    actor: CourseActor,
    input: UpdateLessonMaterialDto
  ): Promise<AdminLessonMaterialResponse> {
    const materialRecord = await this.materialRepository.findMaterialById(input.materialId)
    const currentMaterial = this.ensureMaterialExists(materialRecord)
    this.validateCanManageCourse(actor, currentMaterial.lesson.chapter.course)

    const isFileMaterial = isFileMaterialType(currentMaterial.type)

    if (isFileMaterial && input.contentText !== undefined) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'File materials cannot use contentText')
    }

    if (!isFileMaterial && input.mediaId !== undefined) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Text materials cannot use mediaId')
    }

    const media = input.mediaId ? await this.resolveDocumentMedia(actor, input.mediaId) : null

    const material = await this.materialRepository.updateLessonMaterial({
      materialId: input.materialId,
      title: input.title,
      mediaId: input.mediaId !== undefined ? (media?.id ?? null) : undefined,
      objectKey: input.mediaId !== undefined ? (media?.objectKey ?? null) : undefined,
      contentText: input.contentText,
      isPublic: input.isPublic,
      processingStatus:
        input.mediaId !== undefined || input.contentText !== undefined ? 'pending' : undefined,
      processingError: input.mediaId !== undefined || input.contentText !== undefined ? null : undefined
    })

    if (input.mediaId !== undefined || input.contentText !== undefined) {
      this.ingestLessonMaterial(actor, { materialId: material.id }).catch((err) => {
        console.error(`Auto-ingestion on update failed for material ${material.id}:`, err)
      })
    }

    return mapAdminLessonMaterialResponse(material)
  }

  async deleteLessonMaterial(
    actor: CourseActor,
    input: DeleteLessonMaterialDto
  ): Promise<{ id: string; deleted: true }> {
    const materialRecord = await this.materialRepository.findMaterialById(input.materialId)
    const material = this.ensureMaterialExists(materialRecord)
    this.validateCanManageCourse(actor, material.lesson.chapter.course)

    await this.materialRepository.softDeleteLessonMaterial(input.materialId)

    return {
      id: input.materialId,
      deleted: true
    }
  }

  async ingestLessonMaterial(
    actor: CourseActor,
    input: IngestLessonMaterialDto
  ): Promise<IngestLessonMaterialResponse> {
    const materialRecord = await this.materialRepository.findMaterialById(input.materialId)
    const material = this.ensureMaterialExists(materialRecord)
    this.validateCanManageCourse(actor, material.lesson.chapter.course)

    const isFileMaterial = isFileMaterialType(material.type)
    if (isFileMaterial && !material.objectKey) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Lesson material file is missing objectKey')
    }

    if (!isFileMaterial && !material.contentText?.trim()) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Text material is empty')
    }

    const fileUrl = material.objectKey
      ? await this.storage.createPresignedGetUrl({
          objectKey: material.objectKey,
          expiresInSeconds: 900
        })
      : null

    await this.materialRepository.updateLessonMaterial({
      materialId: input.materialId,
      processingStatus: 'processing',
      processingError: null
    })

    const response = await fetch(`${aiServiceConfig.baseUrl}/api/v1/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(aiServiceConfig.internalToken
          ? { 'X-AI-Service-Token': aiServiceConfig.internalToken }
          : {})
      },
      body: JSON.stringify({
        material_id: material.id,
        media_id: material.mediaId,
        course_id: material.courseId,
        lesson_id: material.lessonId,
        type: material.type,
        title: material.title,
        file_url: fileUrl,
        content_text: material.contentText
      })
    })

    if (!response.ok) {
      const message = await response.text()
      await this.materialRepository.updateLessonMaterial({
        materialId: input.materialId,
        processingStatus: 'failed',
        processingError: message.slice(0, 2000)
      })
      throw new AppError(502, ERROR_CODE.BAD_REQUEST, 'AI ingestion service failed')
    }

    return {
      id: input.materialId,
      processingStatus: 'processing',
      triggered: true
    }
  }
}

export const adminLessonMaterialService = new AdminLessonMaterialService(
  adminLessonMaterialRepository,
  adminLessonRepository,
  mediaRepository,
  mediaStorage
)
