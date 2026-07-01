import { mapMediaUrl } from '~/common/mappers/media.mapper'

import type {
  LearningAssessmentPlacementDto,
  LearningCourseItemDto,
  LearningCourseOverviewDto,
  LearningLessonDetailResponse
} from '../dto'
import type {
  LearningAssessmentPlacementRecord,
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
    teacher: {
      id: course.teacher.id,
      fullName: course.teacher.fullName,
      avatarUrl: mapMediaUrl(course.teacher.avatarObjectKey)
    },
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

const mapLearningAssessmentPlacement = (
  placement: LearningAssessmentPlacementRecord
): LearningAssessmentPlacementDto => ({
  id: placement.id,
  assessmentId: placement.assessmentId,
  title: placement.assessment.title,
  type: placement.assessment.type,
  gradingType: placement.assessment.gradingType
})

export const mapLearningCourseOverview = (
  enrollment: LearningCourseOverviewRecord
): LearningCourseOverviewDto => {
  const courseItem = mapLearningCourseItem(enrollment)

  return {
    ...courseItem,
    assessmentPlacements: enrollment.course.assessmentPlacements.map(mapLearningAssessmentPlacement),
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
          assessmentPlacement: lesson.assessmentPlacements[0]
            ? mapLearningAssessmentPlacement(lesson.assessmentPlacements[0])
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
): LearningLessonDetailResponse => {
  const progress = lesson.progress[0]
  const assessmentPlacement = lesson.assessmentPlacements[0]

  return {
    id: lesson.id,
    title: lesson.title,
    type: lesson.type,
    description: lesson.description,
    videoType: lesson.videoType,
    youtubeUrl: lesson.youtubeUrl,
    durationSec: lesson.durationSec,
    allowPreview: lesson.allowPreview,
    assessmentId: assessmentPlacement?.assessmentId ?? null,
    assessmentPlacementId: assessmentPlacement?.id ?? null,
    assessmentPlacement: assessmentPlacement ? mapLearningAssessmentPlacement(assessmentPlacement) : null,
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
    materials: lesson.materials.map((material) => ({
      id: material.id,
      title: material.title,
      type: material.type,
      contentText: material.contentText,
      downloadUrl: mapMediaUrl(material.media?.objectKey),
      media: material.media
        ? {
            id: material.media.id,
            originalName: material.media.originalName,
            mimeType: material.media.mimeType,
            sizeBytes: material.media.sizeBytes,
            status: material.media.status
          }
        : null
    })),
    progress: {
      watchedSeconds: progress?.watchedSeconds ?? 0,
      lastPositionSec: progress?.lastPositionSec ?? 0,
      isCompleted: progress?.isCompleted ?? false
    }
  }
}
