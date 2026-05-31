import type {
  AdminChapterResponseDto,
  CreateChapterDto,
  DeleteChapterDto,
  ReorderChaptersDto,
  ReorderChaptersResponseDto,
  UpdateChapterDto
} from '../dto'
import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'

import {
  type CourseActor,
  ensureCanManageCourse,
  ensureCourseCanBeEdited,
  ensureCourseCanBeReordered,
  ensureExactReorderIds
} from '../ensures/courses.ensure'
import { adminChapterRepository, adminCourseRepository } from '../repositories'
import type {
  AdminChapterRepositoryPort,
  AdminChapterWithCourseRecord
} from '../ports/admin-chapter-repository.port'
import type {
  AdminCourseRecord,
  AdminCourseRepositoryPort
} from '../ports/admin-course-repository.port'

export class AdminChapterService {
  constructor(
    private readonly chapterRepository: AdminChapterRepositoryPort,
    private readonly courseRepository: AdminCourseRepositoryPort
  ) {}

  private async ensureCourseExists(courseId: string): Promise<AdminCourseRecord> {
    const course = await this.courseRepository.findCourseById(courseId)

    if (!course) {
      throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
    }

    return course
  }

  private async ensureChapterExists(chapterId: string): Promise<AdminChapterWithCourseRecord> {
    const chapter = await this.chapterRepository.findChapterById(chapterId)

    if (!chapter) {
      throw new AppError(404, ERROR_CODE.CHAPTER_NOT_FOUND, ERROR_MESSAGE.CHAPTER_NOT_FOUND)
    }

    return chapter
  }

  async createChapter(
    actor: CourseActor,
    input: CreateChapterDto
  ): Promise<AdminChapterResponseDto> {
    const course = await this.ensureCourseExists(input.courseId)
    ensureCanManageCourse({ actor, course })
    ensureCourseCanBeEdited(course.status)

    return this.chapterRepository.createChapter(input)
  }

  async updateChapter(
    actor: CourseActor,
    input: UpdateChapterDto
  ): Promise<AdminChapterResponseDto> {
    const chapter = await this.ensureChapterExists(input.chapterId)
    ensureCanManageCourse({ actor, course: chapter.course })
    ensureCourseCanBeEdited(chapter.course.status)

    return this.chapterRepository.updateChapter(input)
  }

  async deleteChapter(
    actor: CourseActor,
    input: DeleteChapterDto
  ): Promise<{ id: string; deleted: true }> {
    const chapter = await this.ensureChapterExists(input.chapterId)
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
  ): Promise<ReorderChaptersResponseDto> {
    const course = await this.ensureCourseExists(input.courseId)
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
