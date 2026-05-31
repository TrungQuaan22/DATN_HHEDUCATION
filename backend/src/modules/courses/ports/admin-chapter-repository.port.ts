import type { CourseStatus } from '@prisma/client'

import type { AdminChapterResponseDto, ReorderChaptersResponseDto } from '../dto'

export type AdminChapterRecord = AdminChapterResponseDto

export type AdminChapterWithCourseRecord = AdminChapterRecord & {
  course: {
    id: string
    teacherId: string
    status: CourseStatus
    deletedAt: Date | null
  }
}

export interface AdminChapterRepositoryPort {
  findChapterById(chapterId: string): Promise<AdminChapterWithCourseRecord | null>
  listCourseChapterIds(courseId: string): Promise<Array<{ id: string }>>
  createChapter(data: { courseId: string; title: string }): Promise<AdminChapterRecord>
  updateChapter(data: { chapterId: string; title: string }): Promise<AdminChapterRecord>
  countActiveLessonsByChapter(chapterId: string): Promise<number>
  softDeleteChapter(chapterId: string): Promise<AdminChapterRecord>
  reorderChapters(
    courseId: string,
    chapterIds: string[]
  ): Promise<ReorderChaptersResponseDto['items']>
}
