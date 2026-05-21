import type { LessonType, Subject, VideoType } from '@prisma/client'

export type LearningCourseItemDto = {
  id: string
  title: string
  slug: string
  description: string | null
  subject: Subject
  grade: number
  teacher: {
    id: string
    fullName: string
    avatarUrl: string | null
  }
  thumbnailUrl: string | null
  price: number
  salePrice: number | null
  isFeatured: boolean
  totalLessons: number
  completedLessons: number
  enrolledAt: Date
  lastLearnedAt: Date | null
}

export type ListLearningCoursesResponseDto = {
  items: LearningCourseItemDto[]
}

export type LearningCourseDetailDto = LearningCourseItemDto & {
  chapters: Array<{
    id: string
    title: string
    orderIndex: number
    lessons: Array<{
      id: string
      title: string
      type: LessonType
      description: string | null
      videoType: VideoType | null
      youtubeUrl: string | null
      durationSec: number | null
      allowPreview: boolean
      assessmentId: string | null
      orderIndex: number
      videoMedia: {
        id: string
        url: string | null
      } | null
      progress: {
        watchedSeconds: number
        lastPositionSec: number
        isCompleted: boolean
      }
    }>
  }>
}
