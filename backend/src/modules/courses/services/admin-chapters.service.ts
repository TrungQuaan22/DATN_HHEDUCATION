import type {
  AdminChapterResponseDto,
  CreateChapterDto,
  DeleteChapterDto,
  ReorderChaptersDto,
  ReorderChaptersResponseDto,
  UpdateChapterDto
} from '../dto/admin-chapters.dto'
import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

import {
  type CourseActor,
  ensureCanManageCourse,
  ensureChapterExists,
  ensureCourseExists,
  ensureCourseStructureCanBeAdded,
  ensureCourseStructureCanBeMutated,
  ensureExactReorderIds
} from '../ensures/courses.ensure'
import { courseRepository } from '../repository'

export const adminChapterService = {
  async createChapter(
    actor: CourseActor,
    input: CreateChapterDto
  ): Promise<AdminChapterResponseDto> {
    const course = await ensureCourseExists(input.courseId)
    ensureCanManageCourse({ actor, course })
    ensureCourseStructureCanBeAdded(course.status)

    return courseRepository.createChapter(input)
  },

  async updateChapter(
    actor: CourseActor,
    input: UpdateChapterDto
  ): Promise<AdminChapterResponseDto> {
    const chapter = await ensureChapterExists(input.chapterId)
    ensureCanManageCourse({ actor, course: chapter.course })
    ensureCourseStructureCanBeMutated(chapter.course.status)

    return courseRepository.updateChapter(input)
  },

  async deleteChapter(
    actor: CourseActor,
    input: DeleteChapterDto
  ): Promise<{ id: string; deleted: true }> {
    const chapter = await ensureChapterExists(input.chapterId)
    ensureCanManageCourse({ actor, course: chapter.course })
    ensureCourseStructureCanBeMutated(chapter.course.status)

    const activeLessonsCount = await courseRepository.countActiveLessonsByChapter(input.chapterId)

    if (activeLessonsCount > 0) {
      throw new AppError(
        400,
        ERROR_CODE.BAD_REQUEST,
        'Cannot delete chapter while it still has lessons'
      )
    }

    await courseRepository.softDeleteChapter(input.chapterId)

    return {
      id: input.chapterId,
      deleted: true
    }
  },

  async reorderChapters(
    actor: CourseActor,
    input: ReorderChaptersDto
  ): Promise<ReorderChaptersResponseDto> {
    const course = await ensureCourseExists(input.courseId)
    ensureCanManageCourse({ actor, course })
    ensureCourseStructureCanBeMutated(course.status)

    const currentChapters = await courseRepository.listCourseChapterIds(input.courseId)
    ensureExactReorderIds(
      currentChapters.map((chapter) => chapter.id),
      input.chapterIds
    )

    const items = await courseRepository.reorderChapters(input.courseId, input.chapterIds)

    return {
      courseId: input.courseId,
      items
    }
  }
}
