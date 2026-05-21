import { mapMediaUrl } from '~/common/mappers/media.mapper'
import { mapUserAvatar } from '~/modules/users/mappers/user.mapper'

import type { LearningCourseDetailDto, LearningCourseItemDto } from '../dto/learning.dto'
import type { courseRepository } from '../repository'

//listEnrolledCourses tra ve Enrollment co relation Course va CourseProgress (da tinh so lesson da hoan thanh). khong tra ve chapters/lessons.
type EnrolledCourseListRow = Awaited<
  ReturnType<typeof courseRepository.listEnrolledCourses>
>[number]

//findEnrolledCourseBySlug tra ve Enrollment co relation Course, Chapters, Lessons, LessonProgress va LessonAssessment (neu co).
type EnrolledCourseDetailRow = NonNullable<
  Awaited<ReturnType<typeof courseRepository.findEnrolledCourseBySlug>>
>

// Query list nay khong join chapters/lessons; totalLessons lay tu Course.totalLessons.
// Ket qua tra ve du thong tin co ban cho trang "Khoa hoc cua toi".
export const mapLearningCourseItem = (
  enrollment: EnrolledCourseListRow
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


// map chi tiet hon cho trang "Chi tiet khoa hoc", co them chapters/lessons va progress tung lesson.
// Response giu cac field thuoc Lesson o top-level; relation Media duoc tra ve trong videoMedia.
export const mapLearningCourseDetail = (
  enrollment: EnrolledCourseDetailRow
): LearningCourseDetailDto => {
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
                url: mapMediaUrl(lesson.videoMedia.objectKey)
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
