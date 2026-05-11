import type {
  AdminChapterResponseDto,
  CreateChapterDto,
  DeleteChapterDto,
  ReorderChaptersDto,
  ReorderChaptersResponseDto,
  UpdateChapterDto
} from '../dto/admin-chapters.dto'
import {
  ensureChapterExists,
  ensureCourseCanBeEdited,
  ensureCourseExists,
  ensureExactReorderIds
} from '../ensures/courses.ensure'
import { courseRepository } from '../repository'

export const adminChapterService = {
  async createChapter(input: CreateChapterDto): Promise<AdminChapterResponseDto> {
    const course = await ensureCourseExists(input.courseId)
    ensureCourseCanBeEdited(course.status)

    return courseRepository.createChapter(input)
  },

  async updateChapter(input: UpdateChapterDto): Promise<AdminChapterResponseDto> {
    const chapter = await ensureChapterExists(input.chapterId)
    ensureCourseCanBeEdited(chapter.course.status)

    return courseRepository.updateChapter(input)
  },

  async deleteChapter(input: DeleteChapterDto): Promise<{ id: string; deleted: true }> {
    const chapter = await ensureChapterExists(input.chapterId)
    ensureCourseCanBeEdited(chapter.course.status)

    await courseRepository.deleteChapter(input.chapterId)

    return {
      id: input.chapterId,
      deleted: true
    }
  },

  async reorderChapters(input: ReorderChaptersDto): Promise<ReorderChaptersResponseDto> {
    const course = await ensureCourseExists(input.courseId)
    ensureCourseCanBeEdited(course.status)

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
