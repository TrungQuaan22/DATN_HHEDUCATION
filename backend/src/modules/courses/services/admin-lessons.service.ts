import { LessonType, VideoType } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { ensureActorCanUseVideoMedia } from '~/common/ensures/media.ensure'
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
  ensureCanManageCourse,
  ensureCourseCanBeEdited,
  ensureCourseCanBeReordered,
  ensureCreateLessonPayloadIsValid,
  ensureExactReorderIds
} from '../ensures/courses.ensure'
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

export class AdminLessonService {
  constructor(
    private readonly lessonRepository: AdminLessonRepositoryPort,
    private readonly chapterRepository: AdminChapterRepositoryPort,
    private readonly mediaRepository: MediaRepositoryPort
  ) {}

  private ensureChapterExists(chapter: AdminChapterWithCourseRecord | null): AdminChapterWithCourseRecord {
    if (!chapter) {
      throw new AppError(404, ERROR_CODE.CHAPTER_NOT_FOUND, ERROR_MESSAGE.CHAPTER_NOT_FOUND)
    }

    return chapter
  }

  private ensureLessonExists(lesson: AdminLessonWithChapterRecord | null): AdminLessonWithChapterRecord {
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
    ensureCreateLessonPayloadIsValid(data)

    if (data.type === LessonType.quiz && data.assessmentId) {
      const assessment = await this.lessonRepository.findAssessmentById(data.assessmentId)
      this.ensureAssessmentExists(assessment)
    }

    if (
      data.type === LessonType.video &&
      data.videoType === VideoType.system &&
      data.videoMediaId
    ) {
      const media = await this.mediaRepository.findMediaById(data.videoMediaId)
      ensureActorCanUseVideoMedia({
        actor: data.actor,
        media,
        label: 'Video media'
      })
    }
  }

  async createLesson(actor: CourseActor, input: CreateLessonDto): Promise<AdminLessonResponse> {
    const chapterRecord = await this.chapterRepository.findChapterById(input.chapterId)
    const chapter = this.ensureChapterExists(chapterRecord)
    ensureCanManageCourse({ actor, course: chapter.course })
    ensureCourseCanBeEdited(chapter.course.status)

    await this.validateRelatedLessonData({ actor, ...input })

    const lesson = await this.lessonRepository.createLesson({
      courseId: chapter.course.id,
      chapterId: input.chapterId,
      title: input.title,
      type: input.type,
      description: input.description ?? null,
      videoType: input.type === LessonType.video ? input.videoType : null,
      videoMediaId:
        input.type === LessonType.video && input.videoType === VideoType.system
          ? input.videoMediaId
          : null,
      youtubeUrl:
        input.type === LessonType.video && input.videoType === VideoType.youtube
          ? input.youtubeUrl
          : null,
      durationSec: input.type === LessonType.video ? (input.durationSec ?? null) : null,
      allowPreview: input.allowPreview ?? false,
      assessmentId: input.type === LessonType.quiz ? input.assessmentId : null
    })

    return mapAdminLessonResponse(lesson)
  }

  async updateLesson(actor: CourseActor, input: UpdateLessonDto): Promise<AdminLessonResponse> {
    const lessonRecord = await this.lessonRepository.findLessonById(input.lessonId)
    const lesson = this.ensureLessonExists(lessonRecord)
    ensureCanManageCourse({ actor, course: lesson.chapter.course })
    ensureCourseCanBeEdited(lesson.chapter.course.status)

    // Merge and validate related lesson data
    const type = input.type ?? lesson.type
    const videoType = input.videoType !== undefined ? input.videoType : lesson.videoType
    const videoMediaId = input.videoMediaId !== undefined ? input.videoMediaId : lesson.videoMediaId
    const youtubeUrl = input.youtubeUrl !== undefined ? input.youtubeUrl : lesson.youtubeUrl
    const assessmentId =
      input.assessmentId !== undefined ? input.assessmentId : lesson.assessmentId

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
    ensureCanManageCourse({ actor, course: lesson.chapter.course })
    ensureCourseCanBeEdited(lesson.chapter.course.status)

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
    ensureCanManageCourse({ actor, course: chapter.course })
    ensureCourseCanBeReordered(chapter.course.status)

    const currentLessons = await this.lessonRepository.listChapterLessonIds(input.chapterId)
    ensureExactReorderIds(
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
  mediaRepository
)
