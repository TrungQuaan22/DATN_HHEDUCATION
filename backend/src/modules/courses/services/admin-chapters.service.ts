import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'

import type {
  AdminChapterResponse,
  CreateChapterDto,
  DeleteChapterDto,
  ReorderChaptersDto,
  ReorderChaptersResponse,
  UpdateChapterDto
} from '../dto/admin-chapters.dto'
import {
  type CourseActor,
  ensureCanManageCourse,
  ensureCourseCanBeEdited,
  ensureCourseCanBeReordered,
  ensureExactReorderIds
} from '../ensures/courses.ensure'
import type {
  AdminChapterRepositoryPort,
  AdminChapterWithCourseRecord
} from '../ports/admin-chapter-repository.port'
import type {
  AdminCourseRecord,
  AdminCourseRepositoryPort
} from '../ports/admin-course-repository.port'
import { adminChapterRepository, adminCourseRepository } from '../repositories'

export class AdminChapterService {
  constructor(
    private readonly chapterRepository: AdminChapterRepositoryPort,
    private readonly courseRepository: AdminCourseRepositoryPort
  ) {}

  private ensureCourseExists(course: AdminCourseRecord | null): AdminCourseRecord {
    if (!course) {
      throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
    }

    return course
  }

  private ensureChapterExists(chapter: AdminChapterWithCourseRecord | null): AdminChapterWithCourseRecord {
    if (!chapter) {
      throw new AppError(404, ERROR_CODE.CHAPTER_NOT_FOUND, ERROR_MESSAGE.CHAPTER_NOT_FOUND)
    }

    return chapter
  }

  async createChapter(actor: CourseActor, input: CreateChapterDto): Promise<AdminChapterResponse> {
    const courseRecord = await this.courseRepository.findCourseById(input.courseId)
    const course = this.ensureCourseExists(courseRecord)
    ensureCanManageCourse({ actor, course })
    ensureCourseCanBeEdited(course.status)

    return this.chapterRepository.createChapter(input)
  }

  async updateChapter(actor: CourseActor, input: UpdateChapterDto): Promise<AdminChapterResponse> {
    const chapterRecord = await this.chapterRepository.findChapterById(input.chapterId)
    const chapter = this.ensureChapterExists(chapterRecord)
    ensureCanManageCourse({ actor, course: chapter.course })
    ensureCourseCanBeEdited(chapter.course.status)

    return this.chapterRepository.updateChapter(input)
  }

  async deleteChapter(
    actor: CourseActor,
    input: DeleteChapterDto
  ): Promise<{ id: string; deleted: true }> {
    const chapterRecord = await this.chapterRepository.findChapterById(input.chapterId)
    const chapter = this.ensureChapterExists(chapterRecord)
    ensureCanManageCourse({ actor, course: chapter.course })
    ensureCourseCanBeEdited(chapter.course.status)

    const activeLessonsCount = await this.chapterRepository.countActiveLessonsByChapter(
      input.chapterId
    )

    if (activeLessonsCount > 0) {
      throw new AppError(
        400,
        ERROR_CODE.BAD_REQUEST,
        'Cannot delete chapter while it still has lessons'
      )
    }

    await this.chapterRepository.softDeleteChapter(input.chapterId)

    return {
      id: input.chapterId,
      deleted: true
    }
  }

  async reorderChapters(
    actor: CourseActor,
    input: ReorderChaptersDto
  ): Promise<ReorderChaptersResponse> {
    const courseRecord = await this.courseRepository.findCourseById(input.courseId)
    const course = this.ensureCourseExists(courseRecord)
    ensureCanManageCourse({ actor, course })
    ensureCourseCanBeReordered(course.status)

    const currentChapters = await this.chapterRepository.listCourseChapterIds(input.courseId)
    ensureExactReorderIds(
      currentChapters.map((chapter) => chapter.id),
      input.chapterIds
    )

    const items = await this.chapterRepository.reorderChapters(input.courseId, input.chapterIds)

    return {
      courseId: input.courseId,
      items
    }
  }
}

export const adminChapterService = new AdminChapterService(
  adminChapterRepository,
  adminCourseRepository
)
