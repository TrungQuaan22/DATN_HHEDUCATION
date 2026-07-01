import { Subject, Grade, PaginatedResponseShape } from "@/types/common";

export type CourseTeacherPublic = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
};

export type AdminCourseTeacher = CourseTeacherPublic & {
  email: string;
  avatarMediaId: string | null;
};

export type CourseSummary = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  subject: Subject;
  grade: Grade;
  teacher: CourseTeacherPublic;
  thumbnailUrl: string | null;
  price: number;
  salePrice: number | null;
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  totalLessons: number;
  createdAt: string;
  updatedAt: string;
};

export type CourseLessonPublic = {
  id: string;
  title: string;
  type: "video" | "quiz" | "document";
  videoType?: "system" | "youtube" | null;
  youtubeUrl?: string | null;
  durationSec: number | null;
  orderIndex: number;
  allowPreview: boolean;
};

export type CourseChapterPublic = {
  id: string;
  title: string;
  orderIndex: number;
  lessons: CourseLessonPublic[];
};

export type CourseDetail = CourseSummary & {
  chapters: CourseChapterPublic[];
  relatedCourses: CourseSummary[];
};

export type LearningCourseItem = Omit<
  CourseSummary,
  "status" | "createdAt" | "updatedAt"
> & {
  completedLessons: number;
  enrolledAt: string;
  lastLearnedAt: string | null;
};

export type CourseStatus = "draft" | "published" | "archived";

export type AdminCourseSummary = Omit<CourseSummary, "teacher"> & {
  teacherId: string;
  teacher: AdminCourseTeacher;
  thumbnailMediaId: string | null;
  enrolledCount: number;
};

export type ListAdminCoursesParams = {
  page?: number;
  limit?: number;
  status?: CourseStatus;
  teacherId?: string;
  isFeatured?: boolean;
  search?: string;
};

export type ListAdminCoursesResponse =
  PaginatedResponseShape<AdminCourseSummary>;

export type CreateCourseRequest = {
  title: string;
  description?: string;
  subject: Subject;
  grade: number;
  teacherId: string;
  thumbnailMediaId?: string | null;
  price: number;
  salePrice?: number | null;
  isFeatured?: boolean;
};

export type AdminLessonRequest = {
  title: string;
  type: "video" | "quiz" | "document";
  description?: string | null;
  videoType?: "system" | "youtube" | null;
  videoMediaId?: string | null;
  youtubeUrl?: string | null;
  durationSec?: number | null;
  allowPreview?: boolean;
  assessmentId?: string | null;
};

export type AdminCourseLesson = CourseLessonPublic & {
  chapterId: string;
  description: string | null;
  videoType: "system" | "youtube" | null;
  videoMediaId: string | null;
  assessmentId: string | null;
  hasRagError?: boolean;
  videoMedia: {
    id: string;
    url: string | null;
    originalName: string | null;
    status:
      | "pending_upload"
      | "uploaded"
      | "processing"
      | "ready"
      | "failed"
      | "deleted";
    durationSec: number | null;
  } | null;
};

export type AdminCourseChapter = {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lessons: AdminCourseLesson[];
};

export type AdminCourseTopic = {
  id: string;
  name: string;
  parentId: string | null;
  courseId: string;
};

export type AdminCourseDetail = AdminCourseSummary & {
  topics: AdminCourseTopic[];
  chapters: AdminCourseChapter[];
};

export type CourseStudentProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export type AdminCourseStudent = {
  student: {
    id: string;
    fullName: string;
    email: string;
    avatarMediaId: string | null;
    avatarUrl: string | null;
    status: "pending_verification" | "active" | "banned";
  };
  source: "payment" | "manual" | "free";
  enrolledAt: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  lastLearnedAt: string | null;
  progressStatus: CourseStudentProgressStatus;
  assessmentProgress: {
    completedAssessments: number;
    totalAssessments: number;
    notStartedAssessments: number;
    doingAssessments: number;
    pendingGradingAssessments: number;
    bestScore: string | null;
    latestScore: string | null;
  };
  latestActivityAt: string | null;
};

export type ListAdminCourseStudentsParams = {
  page?: number;
  limit?: number;
  search?: string;
  progressStatus?: CourseStudentProgressStatus;
};

export type ListAdminCourseStudentsResponse =
  PaginatedResponseShape<AdminCourseStudent> & {
    stats: {
      total: number;
      notStarted: number;
      inProgress: number;
      completed: number;
    };
  };

export type AdminCourseStudentLessonProgress = {
  id: string;
  title: string;
  type: "video" | "quiz" | "document";
  orderIndex: number;
  status: CourseStudentProgressStatus;
  progressPercentage: number;
  watchedSeconds: number;
  durationSec: number | null;
  completedAt: string | null;
  lastLearnedAt: string | null;
};

export type AdminCourseStudentProgress = {
  student: AdminCourseStudent["student"];
  enrollment: {
    source: AdminCourseStudent["source"];
    enrolledAt: string;
  };
  course: {
    id: string;
    title: string;
    totalLessons: number;
  };
  summary: {
    completedLessons: number;
    progressPercentage: number;
    lastLearnedAt: string | null;
    progressStatus: CourseStudentProgressStatus;
  };
  chapters: Array<{
    id: string;
    title: string;
    orderIndex: number;
    completedLessons: number;
    totalLessons: number;
    lessons: AdminCourseStudentLessonProgress[];
  }>;
  assessments: Array<{
    id: string;
    title: string;
    status: "not_started" | "doing" | "pending_grading" | "completed";
    attemptCount: number;
    maxAttempts: number | null;
    maxScore: string;
    bestScore: string | null;
    latestScore: string | null;
    latestSubmissionId: string | null;
    latestSubmitTime: string | null;
    latestActivityAt: string | null;
    openTime: string | null;
    closeTime: string | null;
  }>;
};
export type CatalogCourseDetailResponse = CourseDetail;

export type ListTeacherOptionsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type AdminTeacherOptionItem = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
};

export type ListTeacherOptionsResponse =
  PaginatedResponseShape<AdminTeacherOptionItem>;

export type ListCatalogCoursesParams = {
  page?: number;
  limit?: number;
  search?: string;
  subjects?: string;
  featured?: boolean;
  grade?: number;
  sort?: "newest" | "hotest" | "priceAsc" | "priceDesc";
};

export type ListCatalogCoursesResponse = PaginatedResponseShape<CourseSummary>;

export type LearningCourseProgress = {
  watchedSeconds: number;
  lastPositionSec: number;
  isCompleted: boolean;
};

export type MediaStatus =
  | "pending_upload"
  | "uploaded"
  | "processing"
  | "ready"
  | "failed"
  | "deleted";

export type LearningCourseMedia = {
  id: string;
  url: string | null;
  originalName: string | null;
  status: MediaStatus;
  durationSec: number | null;
};

export type LearningCourseOverviewMedia = {
  status: MediaStatus;
};

export type AdminLessonMaterialType =
  | "text"
  | "markdown"
  | "pdf"
  | "docx"
  | "pptx";

export type AdminLessonMaterialProcessingStatus =
  | "pending"
  | "processing"
  | "ready"
  | "failed";

export type LessonMaterialMedia = {
  id: string;
  url: string | null;
  originalName: string | null;
  mimeType: string;
  sizeBytes: number;
  status: MediaStatus;
};

export type AdminLessonMaterial = {
  id: string;
  courseId: string;
  lessonId: string;
  mediaId: string | null;
  title: string;
  type: AdminLessonMaterialType;
  contentText: string | null;
  extractedText: string | null;
  processingStatus: AdminLessonMaterialProcessingStatus;
  processingError: string | null;
  isPublic: boolean;
  media: LessonMaterialMedia | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminLessonMaterialRequest = {
  title: string;
  type: AdminLessonMaterialType;
  isPublic?: boolean;
  mediaId?: string;
  contentText?: string;
};

export type LearningCourseMaterial = {
  id: string;
  title: string;
  type: AdminLessonMaterialType;
  downloadUrl?: string | null;
  contentText?: string | null;
  media?: {
    id: string;
    originalName: string | null;
    sizeBytes: number;
    status: MediaStatus;
  } | null;
};

export type LearningAssessmentPlacement = {
  id: string;
  assessmentId: string;
  title: string;
  type: "exam" | "quiz";
  gradingType: "auto" | "manual" | "mixed";
};

export type LearningLesson = {
  id: string;
  title: string;
  type: "video" | "quiz" | "document";
  description: string | null;
  videoType: "system" | "youtube" | null;
  youtubeUrl: string | null;
  durationSec: number | null;
  allowPreview: boolean;
  assessmentId: string | null;
  assessmentPlacementId: string | null;
  assessmentPlacement: LearningAssessmentPlacement | null;
  orderIndex: number;
  videoMedia: LearningCourseMedia | null;
  materials: LearningCourseMaterial[];
  progress: LearningCourseProgress;
};

export type LearningLessonOverview = {
  id: string;
  title: string;
  type: "video" | "quiz" | "document";
  durationSec: number | null;
  orderIndex: number;
  videoMedia: LearningCourseOverviewMedia | null;
  assessmentPlacement: LearningAssessmentPlacement | null;
  progress: LearningCourseProgress;
};

export type LearningChapter = {
  id: string;
  title: string;
  orderIndex: number;
  lessons: LearningLessonOverview[];
};

export type LearningCourseOverview = LearningCourseItem & {
  assessmentPlacements: LearningAssessmentPlacement[];
  chapters: LearningChapter[];
};

export type LearningLessonDetail = LearningLesson;

export type LearningCourseDetail = LearningCourseOverview;

export type UpdateProgressResponse = {
  lessonId: string;
  courseId: string;
  watchedSeconds: number;
  lastPositionSec: number;
  durationSec: number;
  isCompleted: boolean;
  completedLessons: number;
  totalLessons: number;
};
