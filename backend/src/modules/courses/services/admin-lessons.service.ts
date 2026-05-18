import { LessonType, VideoType } from '@prisma/client'

import { ensureActorCanUseVideoMedia } from '~/common/ensures/media.ensure'
import { buildMediaPublicUrl } from '~/common/utils/media'

import type {
  AdminLessonResponseDto,
  CreateLessonDto,
  DeleteLessonDto,
  ReorderLessonsDto,
  ReorderLessonsResponseDto,
  UpdateLessonDto
} from '../dto/admin-lessons.dto'
import {
  type CourseActor,
  ensureAssessmentExists,
  ensureCanManageCourse,
  ensureChapterExists,
  ensureCourseStructureCanBeAdded,
  ensureCourseStructureCanBeMutated,
  ensureExactReorderIds,
  ensureLessonExists,
  ensureLessonPayloadMatchesType
} from '../ensures/courses.ensure'
import { courseRepository } from '../repository'

const mapLessonResponse = (lesson: {
  id: string
  chapterId: string
  title: string
  type: LessonType
  description: string | null
  videoType: VideoType | null
  videoMediaId: string | null
  videoMedia: { id: string; objectKey: string } | null
  youtubeUrl: string | null
  durationSec: number | null
  allowPreview: boolean
  lessonAssessments: Array<{ assessmentId: string }>
  orderIndex: number
  createdAt: Date
  updatedAt: Date
}): AdminLessonResponseDto => ({
  id: lesson.id,
  chapterId: lesson.chapterId,
  title: lesson.title,
  type: lesson.type,
  description: lesson.description,
  videoType: lesson.videoType,
  videoMediaId: lesson.videoMediaId,
  videoUrl:
    lesson.videoType === VideoType.system
      ? buildMediaPublicUrl(lesson.videoMedia?.objectKey)
      : null,
  youtubeUrl: lesson.youtubeUrl,
  durationSec: lesson.durationSec,
  allowPreview: lesson.allowPreview,
  assessmentId: lesson.lessonAssessments[0]?.assessmentId ?? null,
  orderIndex: lesson.orderIndex,
  createdAt: lesson.createdAt,
  updatedAt: lesson.updatedAt
})

const validateRelatedLessonData = async (data: {
  actor: CourseActor
  type: LessonType
  videoType?: VideoType | null
  videoMediaId?: string | null
  assessmentId?: string | null
  youtubeUrl?: string | null
  description?: string | null
}) => {
  ensureLessonPayloadMatchesType(data)

  if (data.type === LessonType.quiz && data.assessmentId) {
    await ensureAssessmentExists(data.assessmentId)
  }

  if (data.type === LessonType.video && data.videoType === VideoType.system && data.videoMediaId) {
    await ensureActorCanUseVideoMedia({
      actor: data.actor,
      mediaId: data.videoMediaId,
      label: 'Video media'
    })
  }
}

export const adminLessonService = {
  async createLesson(actor: CourseActor, input: CreateLessonDto): Promise<AdminLessonResponseDto> {
    const chapter = await ensureChapterExists(input.chapterId)
    ensureCanManageCourse({ actor, course: chapter.course })
    ensureCourseStructureCanBeAdded(chapter.course.status)

    await validateRelatedLessonData({ actor, ...input })

    const lesson = await courseRepository.createLesson({
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
      durationSec: 'durationSec' in input ? (input.durationSec ?? null) : null,
      allowPreview: input.allowPreview ?? false,
      assessmentId: input.type === LessonType.quiz ? input.assessmentId : null
    })

    return mapLessonResponse(lesson)
  },

  async updateLesson(actor: CourseActor, input: UpdateLessonDto): Promise<AdminLessonResponseDto> {
    const lesson = await ensureLessonExists(input.lessonId)
    ensureCanManageCourse({ actor, course: lesson.chapter.course })
    ensureCourseStructureCanBeMutated(lesson.chapter.course.status)

    const nextType = input.type ?? lesson.type
    const nextVideoType =
      input.videoType !== undefined ? input.videoType : (lesson.videoType ?? null)
    const nextDescription =
      input.description !== undefined ? input.description : (lesson.description ?? null)
    const nextVideoMediaId =
      input.videoMediaId !== undefined ? input.videoMediaId : (lesson.videoMediaId ?? null)
    const nextYoutubeUrl =
      input.youtubeUrl !== undefined ? input.youtubeUrl : (lesson.youtubeUrl ?? null)
    const nextAssessmentId =
      input.assessmentId !== undefined
        ? input.assessmentId
        : (lesson.lessonAssessments[0]?.assessmentId ?? null)
    const nextAllowPreview =
      input.allowPreview !== undefined ? input.allowPreview : lesson.allowPreview

    await validateRelatedLessonData({
      actor,
      type: nextType,
      description: nextDescription,
      videoType: nextVideoType,
      videoMediaId: nextVideoMediaId,
      youtubeUrl: nextYoutubeUrl,
      assessmentId: nextAssessmentId
    })

    const updatedLesson = await courseRepository.updateLesson({
      lessonId: input.lessonId,
      title: input.title ?? lesson.title,
      type: nextType,
      description:
        nextType === LessonType.document ||
        nextType === LessonType.quiz ||
        nextType === LessonType.video
          ? nextDescription
          : null,
      videoType: nextType === LessonType.video ? nextVideoType : null,
      videoMediaId:
        nextType === LessonType.video && nextVideoType === VideoType.system
          ? nextVideoMediaId
          : null,
      youtubeUrl:
        nextType === LessonType.video && nextVideoType === VideoType.youtube
          ? nextYoutubeUrl
          : null,
      durationSec: input.durationSec !== undefined ? input.durationSec : lesson.durationSec,
      allowPreview: nextAllowPreview,
      assessmentId: nextType === LessonType.quiz ? nextAssessmentId : null
    })

    return mapLessonResponse(updatedLesson)
  },

  async deleteLesson(
    actor: CourseActor,
    input: DeleteLessonDto
  ): Promise<{ id: string; deleted: true }> {
    const lesson = await ensureLessonExists(input.lessonId)
    ensureCanManageCourse({ actor, course: lesson.chapter.course })
    ensureCourseStructureCanBeMutated(lesson.chapter.course.status)

    await courseRepository.softDeleteLesson({
      lessonId: input.lessonId,
      courseId: lesson.chapter.course.id
    })

    return {
      id: input.lessonId,
      deleted: true
    }
  },

  async reorderLessons(
    actor: CourseActor,
    input: ReorderLessonsDto
  ): Promise<ReorderLessonsResponseDto> {
    const chapter = await ensureChapterExists(input.chapterId)
    ensureCanManageCourse({ actor, course: chapter.course })
    ensureCourseStructureCanBeMutated(chapter.course.status)

    const currentLessons = await courseRepository.listChapterLessonIds(input.chapterId)
    ensureExactReorderIds(
      currentLessons.map((lesson) => lesson.id),
      input.lessonIds
    )

    const items = await courseRepository.reorderLessons(input.chapterId, input.lessonIds)

    return {
      chapterId: input.chapterId,
      items
    }
  }
}
