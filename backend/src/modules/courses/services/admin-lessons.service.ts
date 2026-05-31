import { LessonType, VideoType } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { ensureActorCanUseVideoMedia } from '~/common/ensures/media.ensure'
import { AppError } from '~/common/error/app-error'

import type {
  AdminLessonResponseDto,
  CreateLessonDto,
  DeleteLessonDto,
  ReorderLessonsDto,
  ReorderLessonsResponseDto,
  UpdateLessonDto
} from '../dto'
import { mapAdminLessonResponse } from '../mappers'
import {
  type CourseActor,
  ensureCanManageCourse,
  ensureCourseCanBeEdited,
  ensureCourseCanBeReordered,
  ensureExactReorderIds,
  ensureCreateLessonPayloadIsValid
} from '../ensures/courses.ensure'
import { adminChapterRepository, adminLessonRepository } from '../repositories'
import type {
  AdminChapterRepositoryPort,
  AdminChapterWithCourseRecord
} from '../ports/admin-chapter-repository.port'
import type {
  AdminLessonRepositoryPort,
  AdminLessonWithChapterRecord
} from '../ports/admin-lesson-repository.port'

export class AdminLessonService {
  constructor(
    private readonly lessonRepository: AdminLessonRepositoryPort,
    private readonly chapterRepository: AdminChapterRepositoryPort
  ) {}

  private async ensureChapterExists(chapterId: string): Promise<AdminChapterWithCourseRecord> {
    const chapter = await this.chapterRepository.findChapterById(chapterId)

    if (!chapter) {
      throw new AppError(404, ERROR_CODE.CHAPTER_NOT_FOUND, ERROR_MESSAGE.CHAPTER_NOT_FOUND)
    }

    return chapter
  }

  private async ensureLessonExists(lessonId: string): Promise<AdminLessonWithChapterRecord> {
    const lesson = await this.lessonRepository.findLessonById(lessonId)

    if (!lesson) {
      throw new AppError(404, ERROR_CODE.LESSON_NOT_FOUND, ERROR_MESSAGE.LESSON_NOT_FOUND)
    }

    return lesson
  }

  private async ensureAssessmentExists(assessmentId: string): Promise<void> {
    const assessment = await this.lessonRepository.findAssessmentById(assessmentId)

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
      await this.ensureAssessmentExists(data.assessmentId)
    }

    if (
      data.type === LessonType.video &&
      data.videoType === VideoType.system &&
      data.videoMediaId
    ) {
      await ensureActorCanUseVideoMedia({
        actor: data.actor,
        mediaId: data.videoMediaId,
        label: 'Video media'
      })
    }
  }

  async createLesson(actor: CourseActor, input: CreateLessonDto): Promise<AdminLessonResponseDto> {
    const chapter = await this.ensureChapterExists(input.chapterId)
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

  async updateLesson(actor: CourseActor, input: UpdateLessonDto): Promise<AdminLessonResponseDto> {
    const lesson = await this.ensureLessonExists(input.lessonId)
    ensureCanManageCourse({ actor, course: lesson.chapter.course })
    ensureCourseCanBeEdited(lesson.chapter.course.status)

    const updatedLesson = await this.lessonRepository.updateLesson({
      lessonId: input.lessonId,
      title: input.title,
      description: input.description,
      allowPreview: input.allowPreview
    })

    return mapAdminLessonResponse(updatedLesson)
  }

  async deleteLesson(
    actor: CourseActor,
    input: DeleteLessonDto
  ): Promise<{ id: string; deleted: true }> {
    const lesson = await this.ensureLessonExists(input.lessonId)
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
  ): Promise<ReorderLessonsResponseDto> {
    const chapter = await this.ensureChapterExists(input.chapterId)
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
  adminChapterRepository
)
