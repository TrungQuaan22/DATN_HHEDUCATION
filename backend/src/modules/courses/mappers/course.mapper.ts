import { mapMediaUrl } from '~/common/mappers/media.mapper'

import type {
  AdminCourseDetailResponse,
  AdminCourseResponse
} from '../dto/admin-courses.dto'
import type { CourseSummary } from '../dto/course-shared.types'
import type {
  AdminCourseDetailRecord,
  AdminCourseRecord
} from '../ports/admin-course-repository.port'
import type { CatalogCourseRecord } from '../ports/public-course-repository.port'

export const mapAdminCourseResponse = (
  course: AdminCourseRecord
): AdminCourseResponse => {
  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    subject: course.subject,
    grade: course.grade,
    teacherId: course.teacherId,
    teacher: {
      id: course.teacher.id,
      fullName: course.teacher.fullName,
      email: course.teacher.email,
      avatarMediaId: course.teacher.avatarMediaId,
      avatarUrl: mapMediaUrl(course.teacher.avatarObjectKey)
    },
    thumbnailUrl: mapMediaUrl(course.thumbnailObjectKey),
    thumbnailMediaId: course.thumbnailMediaId,
    price: course.price,
    salePrice: course.salePrice,
    status: course.status,
    isFeatured: course.isFeatured,
    totalLessons: course.totalLessons,
    enrolledCount: course.enrolledCount,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt
  }
}

export const mapAdminCourseDetailResponse = (
  course: AdminCourseDetailRecord
): AdminCourseDetailResponse => {
  const mappedCourse = mapAdminCourseResponse(course)

  return {
    ...mappedCourse,
    topics: course.topics,
    chapters: course.chapters.map((chapter) => ({
      id: chapter.id,
      courseId: chapter.courseId,
      title: chapter.title,
      orderIndex: chapter.orderIndex,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
      lessons: chapter.lessons.map((lesson) => ({
        id: lesson.id,
        chapterId: lesson.chapterId,
        title: lesson.title,
        type: lesson.type,
        description: lesson.description,
        videoType: lesson.videoType,
        videoMediaId: lesson.videoMediaId,
        youtubeUrl: lesson.youtubeUrl,
        durationSec: lesson.durationSec,
        allowPreview: lesson.allowPreview,
        orderIndex: lesson.orderIndex,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
        videoMedia: lesson.videoMedia
          ? {
              id: lesson.videoMedia.id,
              url: mapMediaUrl(lesson.videoMedia.objectKey),
              originalName: lesson.videoMedia.originalName,
              status: lesson.videoMedia.status,
              durationSec: lesson.videoMedia.durationSec
            }
          : null,
        assessmentId: lesson.assessmentId
      }))
    }))
  }
}

export const mapCatalogCourseResponse = (
  course: CatalogCourseRecord
): CourseSummary => {
  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    subject: course.subject,
    grade: course.grade,
    teacher: {
      id: course.teacher.id,
      fullName: course.teacher.fullName,
      avatarUrl: mapMediaUrl(course.teacher.avatarObjectKey)
    },
    thumbnailUrl: mapMediaUrl(course.thumbnailObjectKey),
    price: course.price,
    salePrice: course.salePrice,
    status: course.status,
    isFeatured: course.isFeatured,
    totalLessons: course.totalLessons,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt
  }
}
