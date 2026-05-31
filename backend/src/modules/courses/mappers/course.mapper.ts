import { mapMediaUrl } from '~/common/mappers/media.mapper'
import { mapUserAvatar } from '~/modules/users/mappers'

import type {
  AdminCourseDetailResponseDto,
  AdminCourseSummary
} from '../dto'

type CourseMediaFields = {
  thumbnailObjectKey?: string | null
  teacher: {
    avatarObjectKey?: string | null
  }
}

type CourseCountFields = {
  _count?: {
    enrollments: number
  }
}

type AdminCourseSummaryFields = Omit<
  AdminCourseSummary,
  'teacher' | 'thumbnailUrl' | 'enrolledCount'
> &
  CourseCountFields & {
    thumbnailObjectKey?: string | null
    teacher: Omit<AdminCourseSummary['teacher'], 'avatarUrl'> & {
      avatarObjectKey?: string | null
    }
  }

type AdminCourseDetailFields = AdminCourseSummaryFields & {
    chapters: Array<{
      id: string
      courseId: string
      title: string
      orderIndex: number
      createdAt: Date
      updatedAt: Date
      lessons: Array<{
        id: string
        chapterId: string
        title: AdminCourseDetailResponseDto['chapters'][number]['lessons'][number]['title']
        type: AdminCourseDetailResponseDto['chapters'][number]['lessons'][number]['type']
        description: string | null
        videoType: AdminCourseDetailResponseDto['chapters'][number]['lessons'][number]['videoType']
        videoMediaId: string | null
        youtubeUrl: string | null
        durationSec: number | null
        allowPreview: boolean
        orderIndex: number
        createdAt: Date
        updatedAt: Date
        videoMedia: {
          id: string
          objectKey: string
          originalName: string | null
          status: AdminCourseDetailResponseDto['chapters'][number]['lessons'][number]['videoMedia'] extends infer T
            ? T extends { status: infer S }
              ? S
              : never
            : never
          durationSec: number | null
        } | null
        lessonAssessments: Array<{
          assessmentId: string
        }>
      }>
    }>
  }

// Chuyen object key noi bo cua course/teacher thanh URL public cho response API.
// Dau vao la record Prisma con thumbnailObjectKey va teacher.avatarObjectKey.
// Dau ra loai bo object key noi bo, thay bang thumbnailUrl va teacher.avatarUrl.
export const mapCourseMedia = <T extends CourseMediaFields>(
  course: T
): Omit<T, 'thumbnailObjectKey' | 'teacher'> & {
  thumbnailUrl: string | null
  teacher: Omit<T['teacher'], 'avatarObjectKey'> & { avatarUrl: string | null }
} => {
  const { thumbnailObjectKey, teacher, ...rest } = course

  return {
    ...rest,
    teacher: mapUserAvatar(teacher),
    thumbnailUrl: mapMediaUrl(thumbnailObjectKey)
  }
}

// Mapper cho API admin course; admin cung can URL anh dung duoc thay vi object key noi bo.
export const mapAdminCourseResponse = (
  course: AdminCourseSummaryFields
): AdminCourseSummary => {
  const mappedCourse = mapCourseMedia(course)
  const { _count, ...rest } = mappedCourse

  return {
    ...rest,
    enrolledCount: _count?.enrollments ?? 0
  }
}

export const mapAdminCourseDetailResponse = (
  course: AdminCourseDetailFields
): AdminCourseDetailResponseDto => {
  const mappedCourse = mapAdminCourseResponse(course)

  return {
    ...mappedCourse,
    chapters: course.chapters.map((chapter) => ({
      ...chapter,
      lessons: chapter.lessons.map((lesson) => {
        const { lessonAssessments, videoMedia, ...lessonFields } = lesson

        return {
          ...lessonFields,
          assessmentId: lessonAssessments[0]?.assessmentId ?? null,
          videoMedia: videoMedia
            ? {
                id: videoMedia.id,
                url: mapMediaUrl(videoMedia.objectKey),
                originalName: videoMedia.originalName,
                status: videoMedia.status,
                durationSec: videoMedia.durationSec
              }
            : null
        }
      })
    }))
  }
}

export const mapCatalogCourseResponse = mapCourseMedia

