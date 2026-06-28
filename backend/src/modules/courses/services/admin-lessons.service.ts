import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { ensureMediaExists } from '~/common/ensures/media.ensure'
import { validateVideoMedia } from '~/common/policies/media.policy'
import { AppError } from '~/common/error/app-error'

import type {
  AdminLessonResponse,
  CreateLessonDto,
  DeleteLessonDto,
  ReorderLessonsDto,
  ReorderLessonsResponse,
  UpdateLessonDto
} from '../dto/admin-lessons.dto'
import {
  type CourseActor,
  validateCourseCanBeEdited,
  validateCourseCanManage,
  validateCourseCanBeReordered,
  validateReorderIds
} from '../policies/course.policy'
import { validateLessonPayload } from '../policies/lesson.policy'
import type { LessonType, VideoType } from '@prisma/client'
import { mapAdminLessonResponse } from '../mappers'
import type {
  AdminChapterRepositoryPort,
  AdminChapterWithCourseRecord
} from '../ports/admin-chapter-repository.port'
import type {
  AdminLessonRepositoryPort,
  AdminLessonWithChapterRecord
} from '../ports/admin-lesson-repository.port'
import { adminChapterRepository, adminLessonRepository } from '../repositories'
import { mediaRepository } from '~/modules/media/repository'
import type { MediaRepositoryPort } from '~/modules/media/ports/media-repository.port'
import {
  notificationEventService,
  type NotificationEventService
} from '~/modules/notifications/service'

export class AdminLessonService {
  constructor(
    private readonly lessonRepository: AdminLessonRepositoryPort,
    private readonly chapterRepository: AdminChapterRepositoryPort,
    private readonly mediaRepository: MediaRepositoryPort,
    private readonly notifications: NotificationEventService
  ) {}

  private ensureChapterExists(
    chapter: AdminChapterWithCourseRecord | null
  ): AdminChapterWithCourseRecord {
    if (!chapter) {
      throw new AppError(404, ERROR_CODE.CHAPTER_NOT_FOUND, ERROR_MESSAGE.CHAPTER_NOT_FOUND)
    }

    return chapter
  }

  private ensureLessonExists(
    lesson: AdminLessonWithChapterRecord | null
  ): AdminLessonWithChapterRecord {
    if (!lesson) {
      throw new AppError(404, ERROR_CODE.LESSON_NOT_FOUND, ERROR_MESSAGE.LESSON_NOT_FOUND)
    }

    return lesson
  }

  private ensureAssessmentExists(assessment: { id: string } | null): void {
    if (!assessment) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Assessment not found')
    }
  }

  private async validateRelatedLessonData(data: {
    actor: CourseActor
    type: LessonType
    videoType?: VideoType | null
    videoMediaId?: string | null
    assessmentId?: string | null
    youtubeUrl?: string | null
    description?: string | null
  }): Promise<void> {
    validateLessonPayload(data)

    if (data.type === 'quiz' && data.assessmentId) {
      const assessment = await this.lessonRepository.findAssessmentById(data.assessmentId)
      this.ensureAssessmentExists(assessment)
    }

    if (data.type === 'video' && data.videoType === 'system' && data.videoMediaId) {
      const media = await this.mediaRepository.findMediaById(data.videoMediaId)
      const videoMedia = ensureMediaExists(media)
      validateVideoMedia(data.actor, videoMedia, 'Video media')
    }
  }

  async createLesson(actor: CourseActor, input: CreateLessonDto): Promise<AdminLessonResponse> {
    const chapterRecord = await this.chapterRepository.findChapterById(input.chapterId)
    const chapter = this.ensureChapterExists(chapterRecord)

    validateCourseCanManage(chapter.course, actor)
    validateCourseCanBeEdited(chapter.course)

    await this.validateRelatedLessonData({ actor, ...input })

    const lesson = await this.lessonRepository.createLesson({
      courseId: chapter.course.id,
      chapterId: input.chapterId,
      title: input.title,
      type: input.type,
      description: input.description ?? null,
      videoType: input.type === 'video' ? input.videoType : null,
      videoMediaId:
        input.type === 'video' && input.videoType === 'system' ? input.videoMediaId : null,
      youtubeUrl: input.type === 'video' && input.videoType === 'youtube' ? input.youtubeUrl : null,
      durationSec: input.type === 'video' ? (input.durationSec ?? null) : null,
      allowPreview: input.allowPreview ?? false,
      assessmentId: input.type === 'quiz' ? input.assessmentId : null
    })

    if (chapter.course.status === 'published') {
      await this.notifications.notifyCourseStudentsAboutNewLesson({
        courseId: chapter.course.id,
        courseTitle: chapter.course.title,
        courseSlug: chapter.course.slug,
        lessonId: lesson.id,
        lessonTitle: lesson.title
      })
    }

    return mapAdminLessonResponse(lesson)
  }

  async updateLesson(actor: CourseActor, input: UpdateLessonDto): Promise<AdminLessonResponse> {
    const lessonRecord = await this.lessonRepository.findLessonById(input.lessonId)
    const lesson = this.ensureLessonExists(lessonRecord)

    validateCourseCanManage(lesson.chapter.course, actor)
    validateCourseCanBeEdited(lesson.chapter.course)

    // Merge and validate related lesson data
    const type = input.type ?? lesson.type
    const videoType = input.videoType !== undefined ? input.videoType : lesson.videoType
    const videoMediaId = input.videoMediaId !== undefined ? input.videoMediaId : lesson.videoMediaId
    const youtubeUrl = input.youtubeUrl !== undefined ? input.youtubeUrl : lesson.youtubeUrl
    const assessmentId = input.assessmentId !== undefined ? input.assessmentId : lesson.assessmentId

    await this.validateRelatedLessonData({
      actor,
      type,
      videoType,
      videoMediaId,
      youtubeUrl,
      assessmentId
    })

    const updatedLesson = await this.lessonRepository.updateLesson({
      lessonId: input.lessonId,
      title: input.title,
      description: input.description,
      allowPreview: input.allowPreview,
      type: input.type,
      videoType: input.videoType,
      videoMediaId: input.videoMediaId,
      youtubeUrl: input.youtubeUrl,
      durationSec: input.durationSec,
      assessmentId: input.assessmentId
    })

    return mapAdminLessonResponse(updatedLesson)
  }

  async deleteLesson(
    actor: CourseActor,
    input: DeleteLessonDto
  ): Promise<{ id: string; deleted: true }> {
    const lessonRecord = await this.lessonRepository.findLessonById(input.lessonId)
    const lesson = this.ensureLessonExists(lessonRecord)

    validateCourseCanManage(lesson.chapter.course, actor)
    validateCourseCanBeEdited(lesson.chapter.course)

    await this.lessonRepository.softDeleteLesson({
      lessonId: input.lessonId,
      courseId: lesson.chapter.course.id
    })

    return {
      id: input.lessonId,
      deleted: true
    }
  }

  async reorderLessons(
    actor: CourseActor,
    input: ReorderLessonsDto
  ): Promise<ReorderLessonsResponse> {
    const chapterRecord = await this.chapterRepository.findChapterById(input.chapterId)
    const chapter = this.ensureChapterExists(chapterRecord)

    validateCourseCanManage(chapter.course, actor)
    validateCourseCanBeReordered(chapter.course)

    const currentLessons = await this.lessonRepository.listChapterLessonIds(input.chapterId)
    validateReorderIds(
      currentLessons.map((lesson) => lesson.id),
      input.lessonIds
    )

    const items = await this.lessonRepository.reorderLessons(input.chapterId, input.lessonIds)

    return {
      chapterId: input.chapterId,
      items
    }
  }
}

export const adminLessonService = new AdminLessonService(
  adminLessonRepository,
  adminChapterRepository,
  mediaRepository,
  notificationEventService
)
