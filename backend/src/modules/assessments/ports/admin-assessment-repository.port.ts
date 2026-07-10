import type {
  Assessment,
  AssessmentPlacement,
  Media,
  Subject,
  AssessmentVisibility,
  AssessmentItemType,
  AssessmentType,
  UserRole,
  AssessmentSection,
  AssessmentItem,
  SubmissionEssayAnswer,
  GradingType
} from '@prisma/client'

import type {
  CreateAssessmentItemDto,
  CreateAssessmentDto,
  CreatePlacementDto
} from '../dto'

import type {
  AdminAssessmentListItem,
  GradingSubmissionListItem,
  AdminAssessmentDetail,
  AssessmentForPublishDetail,
  SectionItemDetail,
  StudentSubmissionComplete
} from '../types'

export interface ListAdminAssessmentsFilters {
  scope?: 'all' | 'public' | 'course' | 'unplaced'
  courseId?: string
  visibility?: AssessmentVisibility
  subject?: Subject
  grade?: number
  gradingType?: GradingType
  teacherId?: string
  role?: UserRole
}


export interface AdminAssessmentRepositoryPort {
  // Lấy danh sách assessment cho trang quản trị.
  listAdminAssessments(data: {
    filters: ListAdminAssessmentsFilters
    page: number
    limit: number
  }): Promise<[AdminAssessmentListItem[], number]>

  // Lấy danh sách submission cần chấm thủ công.
  listGradingSubmissions(data: {
    actor: { id: string; role: UserRole }
    assessmentId?: string
    page: number
    limit: number
  }): Promise<[GradingSubmissionListItem[], number]>

  // Tạo assessment mới.
  createAssessment(data: CreateAssessmentDto): Promise<Assessment>

  // Cập nhật thông tin assessment.
  updateAssessment(id: string, data: Partial<CreateAssessmentDto>): Promise<Assessment>

  // Tạo section trong assessment.
  createSection(data: {
    assessmentId: string
    title: string
    description?: string | null
    itemType: AssessmentItemType
  }): Promise<AssessmentSection & { items: AssessmentItem[] }>

  // Cập nhật section trong assessment.
  updateSection(data: {
    assessmentId: string
    sectionId: string
    title?: string
    description?: string | null
  }): Promise<AssessmentSection & { items: AssessmentItem[] }>

  // Xóa section khỏi assessment.
  deleteSection(assessmentId: string, sectionId: string): Promise<AssessmentSection | null>

  // Tìm assessment để chỉnh sửa/quản lý.
  findAssessmentById(id: string): Promise<AdminAssessmentDetail | null>

  // Tìm assessment đầy đủ để validate publish.
  findAssessmentForPublish(id: string): Promise<AssessmentForPublishDetail | null>

  // Tìm media PDF sẵn sàng làm đề nguồn.
  findDocumentMediaById(id: string): Promise<Media | null>

  // Tìm course dùng cho placement.
  findCourseForPlacement(courseId: string): Promise<{
    id: string
    subject: Subject
    grade: number
    teacherId: string
  } | null>

  // Tìm lesson dùng cho placement.
  findLessonForPlacement(lessonId: string): Promise<{
    id: string
    type: string
    chapter: {
      course: {
        id: string
        subject: Subject
        grade: number
        teacherId: string
      }
    }
  } | null>

  // Liệt kê topic của course.
  listTopicsByCourse(courseId: string): Promise<Array<{
    id: string
    name: string
    parentId: string | null
    courseId: string
  }>>

  // Tìm section cụ thể trong assessment.
  findSectionInAssessment(assessmentId: string, sectionId: string): Promise<(AssessmentSection & { items: AssessmentItem[] }) | null>

  // Tạo nhiều item/câu hỏi cho section.
  createSectionItems(data: {
    assessmentId: string
    sectionId: string
    assessmentType: AssessmentType
    items: CreateAssessmentItemDto[]
    courseId?: string | null
  }): Promise<SectionItemDetail[] | null>

  // Cập nhật một item/câu hỏi.
  updateSectionItem(data: {
    assessmentId: string
    itemId: string
    item: Partial<CreateAssessmentItemDto>
  }): Promise<SectionItemDetail | null>

  // Xóa một item/câu hỏi.
  deleteSectionItem(assessmentId: string, itemId: string): Promise<{ id: string; questionId: string | null } | null>

  // Publish assessment.
  publishAssessment(id: string): Promise<Assessment>

  // Cập nhật visibility của assessment.
  updateVisibility(id: string, visibility: AssessmentVisibility): Promise<Assessment>

  // Tạo placement cho assessment.
  createPlacement(data: CreatePlacementDto): Promise<AssessmentPlacement & { assessment: Assessment }>

  // Upsert placement chính của assessment.
  upsertSinglePlacement(assessmentId: string, data: Omit<CreatePlacementDto, 'assessmentId'>): Promise<AssessmentPlacement & { assessment: Assessment }>

  // Xóa placement chính của assessment.
  deleteSinglePlacement(assessmentId: string): Promise<Assessment | { id: string; visibility: AssessmentVisibility } | null>

  // Tìm placement trùng target.
  findDuplicatePlacement(data: CreatePlacementDto): Promise<AssessmentPlacement | null>

  // Tìm submission để chấm bài.
  findSubmissionForGrading(submissionId: string): Promise<StudentSubmissionComplete | null>

  // Clone assessment và nội dung liên quan.
  cloneAssessment(data: {
    assessmentId: string
    createdById: string
    title: string
  }): Promise<Assessment | null>

  // Ghi điểm essay.
  gradeEssay(data: {
    submissionId: string
    itemId: string
    teacherScore: number
    teacherNote?: string | null
    gradedBy: string
  }): Promise<SubmissionEssayAnswer>

  // Chốt điểm cuối cho submission.
  finalizeSubmission(submissionId: string, finalScore: number | string): Promise<StudentSubmissionComplete>
}
