import type { CourseStatus } from '@prisma/client'

export type AdminChapterRecord = {
  id: string
  courseId: string
  title: string
  orderIndex: number
  createdAt: Date
  updatedAt: Date
}

export type AdminChapterWithCourseRecord = AdminChapterRecord & {
  course: {
    id: string
    title: string
    slug: string
    teacherId: string
    status: CourseStatus
    price: number
    salePrice: number | null
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
  ): Promise<Array<{ id: string; orderIndex: number }>>
}
