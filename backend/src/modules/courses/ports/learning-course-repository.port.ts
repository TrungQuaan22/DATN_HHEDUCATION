import type {
  AssessmentType,
  Enrollment,
  GradingType,
  LessonProgress,
  LessonType,
  MediaStatus,
  Subject,
  VideoType
} from '@prisma/client'

export type LearningTeacherRecord = {
  id: string
  fullName: string
  avatarObjectKey: string | null
}

export type LearningCourseProgressRecord = {
  completedLessons: number
  lastLearnedAt: Date | null
}

export type LearningAssessmentPlacementRecord = {
  id: string
  assessmentId: string
  assessment: {
    title: string
    type: AssessmentType
    gradingType: GradingType
  }
}

export type LearningCourseRecord = {
  id: string
  title: string
  slug: string
  description: string | null
  subject: Subject
  grade: number
  thumbnailObjectKey: string | null
  price: number
  salePrice: number | null
  isFeatured: boolean
  totalLessons: number
  teacher: LearningTeacherRecord
  courseProgress: LearningCourseProgressRecord[]
}

export type LearningEnrollmentCourseRecord = {
  enrolledAt: Date
  course: LearningCourseRecord
}

export type LearningLessonProgressRecord = {
  watchedSeconds: number
  lastPositionSec: number
  isCompleted: boolean
}

export type LearningCourseOverviewRecord = LearningEnrollmentCourseRecord & {
  course: LearningCourseRecord & {
    assessmentPlacements: LearningAssessmentPlacementRecord[]
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
        assessmentPlacements: LearningAssessmentPlacementRecord[]
        progress: LearningLessonProgressRecord[]
      }>
    }>
  }
}

export type LearningLessonDetailRecord = {
  id: string
  title: string
  type: LessonType
  description: string | null
  videoType: VideoType | null
  youtubeUrl: string | null
  durationSec: number | null
  allowPreview: boolean
  orderIndex: number
  videoMedia: {
    id: string
    objectKey: string
    originalName: string | null
    status: MediaStatus
    durationSec: number | null
  } | null
  assessmentPlacements: LearningAssessmentPlacementRecord[]
  progress: LearningLessonProgressRecord[]
}

export type LearningSystemVideoLessonRecord = {
  id: string
  videoMedia: {
    objectKey: string
    status: MediaStatus
  } | null
}

export type LearningLessonForProgressRecord = {
  id: string
  durationSec: number | null
  videoMedia: {
    durationSec: number | null
  } | null
  chapter: {
    courseId: string
    course: {
      totalLessons: number
      deletedAt: Date | null
    }
  }
}

export interface LearningCourseRepositoryPort {
  listEnrolledCourses(data: {
    userId: string
    skip: number
    take: number
  }): Promise<[LearningEnrollmentCourseRecord[], number]>
  findEnrolledCourseOverviewBySlug(data: {
    userId: string
    courseSlug: string
  }): Promise<LearningCourseOverviewRecord | null>
  findEnrolledLessonById(data: {
    userId: string
    lessonId: string
  }): Promise<LearningLessonDetailRecord | null>
  findEnrolledSystemVideoLessonForHls(data: {
    userId: string
    lessonId: string
  }): Promise<LearningSystemVideoLessonRecord | null>
  findLessonForProgress(lessonId: string): Promise<LearningLessonForProgressRecord | null>
  findEnrollment(userId: string, courseId: string): Promise<Enrollment | null>
  findLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | null>
  saveLessonAndCourseProgress(data: {
    userId: string
    lessonId: string
    courseId: string
    watchedSeconds: number
    lastPositionSec: number
    durationSec: number
    isCompleted: boolean
    completedAt: Date | null
    newlyCompleted: boolean
    now: Date
  }): Promise<{
    watchedSeconds: number
    lastPositionSec: number
    isCompleted: boolean
    completedLessons: number
  }>
}
