import { mapMediaUrl } from '~/common/mappers/media.mapper'
import { mapUserAvatar } from '~/modules/users/mappers'

import type {
  LearningCourseItemDto,
  LearningCourseOverviewDto,
  LearningLessonDetailDto
} from '../dto'
import type {
  LearningCourseOverviewRecord,
  LearningEnrollmentCourseRecord,
  LearningLessonDetailRecord
} from '../ports/learning-course-repository.port'

// Query list nay khong join chapters/lessons; totalLessons lay tu Course.totalLessons.
// Ket qua tra ve du thong tin co ban cho trang "Khoa hoc cua toi".
export const mapLearningCourseItem = (
  enrollment: LearningEnrollmentCourseRecord
): LearningCourseItemDto => {
  const course = enrollment.course
  const courseProgress = course.courseProgress[0]
  const completedLessons = courseProgress?.completedLessons ?? 0

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    subject: course.subject,
    grade: course.grade,
    teacher: mapUserAvatar(course.teacher),
    thumbnailUrl: mapMediaUrl(course.thumbnailObjectKey),
    price: course.price,
    salePrice: course.salePrice,
    isFeatured: course.isFeatured,
    totalLessons: course.totalLessons,
    completedLessons,
    enrolledAt: enrollment.enrolledAt,
    lastLearnedAt: courseProgress?.lastLearnedAt ?? null
  }
}


export const mapLearningCourseOverview = (
  enrollment: LearningCourseOverviewRecord
): LearningCourseOverviewDto => {
  const courseItem = mapLearningCourseItem(enrollment)

  return {
    ...courseItem,
    chapters: enrollment.course.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      orderIndex: chapter.orderIndex,
      lessons: chapter.lessons.map((lesson) => {
        const progress = lesson.progress[0]

        return {
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          durationSec: lesson.durationSec,
          orderIndex: lesson.orderIndex,
          videoMedia: lesson.videoMedia
            ? {
                status: lesson.videoMedia.status
              }
            : null,
          progress: {
            watchedSeconds: progress?.watchedSeconds ?? 0,
            lastPositionSec: progress?.lastPositionSec ?? 0,
            isCompleted: progress?.isCompleted ?? false
          }
        }
      })
    }))
  }
}

export const mapLearningLessonDetail = (
  lesson: LearningLessonDetailRecord
): LearningLessonDetailDto => {
  const progress = lesson.progress[0]

  return {
    id: lesson.id,
    title: lesson.title,
    type: lesson.type,
    description: lesson.description,
    videoType: lesson.videoType,
    youtubeUrl: lesson.youtubeUrl,
    durationSec: lesson.durationSec,
    allowPreview: lesson.allowPreview,
    assessmentId: lesson.lessonAssessments[0]?.assessmentId ?? null,
    orderIndex: lesson.orderIndex,
    videoMedia: lesson.videoMedia
      ? {
          id: lesson.videoMedia.id,
          url: mapMediaUrl(lesson.videoMedia.objectKey),
          originalName: lesson.videoMedia.originalName,
          status: lesson.videoMedia.status,
          durationSec: lesson.videoMedia.durationSec
        }
      : null,
    materials: [],
    progress: {
      watchedSeconds: progress?.watchedSeconds ?? 0,
      lastPositionSec: progress?.lastPositionSec ?? 0,
      isCompleted: progress?.isCompleted ?? false
    }
  }
}
