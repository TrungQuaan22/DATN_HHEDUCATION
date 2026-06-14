import { MediaStatus } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { ERROR_MESSAGE } from '~/common/constant/error-message'
import { AppError } from '~/common/error/app-error'
import * as policy from '../policies/learning-progress.policy'

import type {
  LearningCourseOverviewDto,
  LearningLessonDetailResponse,
  ListLearningCoursesResponse,
  UpdateLessonProgressResponse
} from '../dto'
import {
  mapLearningCourseItem,
  mapLearningCourseOverview,
  mapLearningLessonDetail
} from '../mappers'
import { learningCourseRepository } from '../repositories'
import { hlsStorage } from '../adapters/r2-hls-storage.adapter'
import type { HlsStoragePort } from '../ports/hls-storage.port'
import type { LearningCourseRepositoryPort } from '../ports/learning-course-repository.port'

const HLS_PLAYLIST_CONTENT_TYPE = 'application/vnd.apple.mpegurl'
const HLS_SEGMENT_CONTENT_TYPE = 'video/MP2T'
const HLS_FILE_PATTERN = /^(index\.m3u8|segment_\d{3,}\.ts)$/

const ensureValidHlsFileName = (fileName: string) => {
  if (!HLS_FILE_PATTERN.test(fileName)) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Invalid HLS file name')
  }
}

const buildHlsObjectKey = (playlistObjectKey: string, fileName: string) => {
  const hlsFolder = playlistObjectKey.slice(0, playlistObjectKey.lastIndexOf('/'))

  return `${hlsFolder}/${fileName}`
}

const getHlsContentType = (fileName: string) => {
  return fileName.endsWith('.m3u8') ? HLS_PLAYLIST_CONTENT_TYPE : HLS_SEGMENT_CONTENT_TYPE
}

export class LearningCourseService {
  constructor(
    private readonly courseRepository: LearningCourseRepositoryPort,
    private readonly hlsStorage: HlsStoragePort
  ) {}

  async listMyCourses(data: {
    userId: string
    page: number
    limit: number
  }): Promise<ListLearningCoursesResponse> {
    const skip = (data.page - 1) * data.limit
    const take = data.limit

    const [enrollments, totalItems] = await this.courseRepository.listEnrolledCourses({
      userId: data.userId,
      skip,
      take
    })

    return {
      items: enrollments.map(mapLearningCourseItem),
      pagination: {
        page: data.page,
        limit: data.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / data.limit)
      }
    }
  }

  async getLearningCourse(data: {
    userId: string
    courseSlug: string
  }): Promise<LearningCourseOverviewDto> {
    const enrollment = await this.courseRepository.findEnrolledCourseOverviewBySlug(data)

    if (!enrollment) {
      throw new AppError(404, ERROR_CODE.COURSE_NOT_FOUND, ERROR_MESSAGE.COURSE_NOT_FOUND)
    }

    return mapLearningCourseOverview(enrollment)
  }

  async getLearningLesson(data: {
    userId: string
    lessonId: string
  }): Promise<LearningLessonDetailResponse> {
    const lesson = await this.courseRepository.findEnrolledLessonById(data)

    if (!lesson) {
      throw new AppError(404, ERROR_CODE.LESSON_NOT_FOUND, ERROR_MESSAGE.LESSON_NOT_FOUND)
    }

    return mapLearningLessonDetail(lesson)
  }

  async getLearningLessonHlsFile(data: {
    userId: string
    lessonId: string
    fileName: string
  }) {
    ensureValidHlsFileName(data.fileName)

    const lesson = await this.courseRepository.findEnrolledSystemVideoLessonForHls(data)

    if (!lesson || !lesson.videoMedia) {
      throw new AppError(404, ERROR_CODE.LESSON_NOT_FOUND, ERROR_MESSAGE.LESSON_NOT_FOUND)
    }

    if (lesson.videoMedia.status !== MediaStatus.ready) {
      throw new AppError(409, ERROR_CODE.CONFLICT, 'Video is not ready')
    }

    const objectKey = buildHlsObjectKey(lesson.videoMedia.objectKey, data.fileName)
    const object = await this.hlsStorage.getObject(objectKey)

    if (!object) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'HLS file not found')
    }

    return {
      body: object.body,
      contentLength: object.contentLength,
      contentType: getHlsContentType(data.fileName)
    }
  }

  async updateLessonProgress(data: {
    userId: string
    lessonId: string
    watchedSeconds: number
    lastPositionSec: number
  }): Promise<UpdateLessonProgressResponse> {
    const now = new Date()

    const lesson = await this.courseRepository.findLessonForProgress(data.lessonId)
    policy.ensureLessonAvailable(lesson)

    const courseId = lesson.chapter.courseId
    const enrollment = await this.courseRepository.findEnrollment(data.userId, courseId)
    policy.ensureUserIsEnrolled(enrollment)

    const durationSec = policy.getLessonDuration(lesson)
    policy.validateProgressRange(data.watchedSeconds, data.lastPositionSec, durationSec)

    const existingProgress = await this.courseRepository.findLessonProgress(
      data.userId,
      data.lessonId
    )
    const progressState = policy.calculateProgressState({
      existingProgress,
      watchedSeconds: data.watchedSeconds,
      lastPositionSec: data.lastPositionSec,
      durationSec,
      now
    })

    const updated = await this.courseRepository.saveLessonAndCourseProgress({
      userId: data.userId,
      lessonId: data.lessonId,
      courseId,
      watchedSeconds: progressState.finalWatchedSeconds,
      lastPositionSec: data.lastPositionSec,
      durationSec,
      isCompleted: progressState.isNowCompleted,
      completedAt: progressState.completedAt,
      newlyCompleted: progressState.newlyCompleted,
      now
    })

    return {
      lessonId: data.lessonId,
      courseId,
      watchedSeconds: updated.watchedSeconds,
      lastPositionSec: updated.lastPositionSec,
      durationSec,
      isCompleted: updated.isCompleted,
      completedLessons: updated.completedLessons,
      totalLessons: lesson.chapter.course.totalLessons
    }
  }
}

export const learningCourseService = new LearningCourseService(learningCourseRepository, hlsStorage)
