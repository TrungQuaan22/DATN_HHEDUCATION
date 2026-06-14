import type {
  AssessmentType,
  GradingType,
  LessonType,
  MediaStatus,
  Subject,
  VideoType
} from '@prisma/client'

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

export type LearningAssessmentPlacementDto = {
  id: string
  assessmentId: string
  title: string
  type: AssessmentType
  gradingType: GradingType
}

export type ListLearningCoursesResponse = {
  items: LearningCourseItemDto[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export type LearningCourseOverviewDto = LearningCourseItemDto & {
  assessmentPlacements: LearningAssessmentPlacementDto[]
  chapters: Array<{
    id: string
    title: string
    orderIndex: number
    lessons: Array<{
      id: string
      title: string
      type: LessonType
      durationSec: number | null
      orderIndex: number
      videoMedia: {
        status: MediaStatus
      } | null
      assessmentPlacement: LearningAssessmentPlacementDto | null
      progress: {
        watchedSeconds: number
        lastPositionSec: number
        isCompleted: boolean
      }
    }>
  }>
}

export type LearningLessonDetailResponse = {
  id: string
  title: string
  type: LessonType
  description: string | null
  videoType: VideoType | null
  youtubeUrl: string | null
  durationSec: number | null
  allowPreview: boolean
  assessmentId: string | null
  assessmentPlacementId: string | null
  assessmentPlacement: LearningAssessmentPlacementDto | null
  orderIndex: number
  videoMedia: {
    id: string
    url: string | null
    originalName: string | null
    status: MediaStatus
    durationSec: number | null
  } | null
  materials: Array<never>
  progress: {
    watchedSeconds: number
    lastPositionSec: number
    isCompleted: boolean
  }
}

export type UpdateLessonProgressResponse = {
  lessonId: string
  courseId: string
  watchedSeconds: number
  lastPositionSec: number
  durationSec: number
  isCompleted: boolean
  completedLessons: number
  totalLessons: number
}
