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
  listAdminAssessments(data: {
    filters: ListAdminAssessmentsFilters
    skip: number
    take: number
  }): Promise<[AdminAssessmentListItem[], number]>

  listGradingSubmissions(data: {
    actor: { id: string; role: UserRole }
    assessmentId?: string
    skip: number
    take: number
  }): Promise<[GradingSubmissionListItem[], number]>

  createAssessment(data: CreateAssessmentDto): Promise<Assessment>

  updateAssessment(id: string, data: Partial<CreateAssessmentDto>): Promise<Assessment>

  createSection(data: {
    assessmentId: string
    title: string
    description?: string | null
    itemType: AssessmentItemType
  }): Promise<AssessmentSection & { items: AssessmentItem[] }>

  updateSection(data: {
    assessmentId: string
    sectionId: string
    title?: string
    description?: string | null
  }): Promise<AssessmentSection & { items: AssessmentItem[] }>

  deleteSection(assessmentId: string, sectionId: string): Promise<AssessmentSection | null>

  findAssessmentById(id: string): Promise<AdminAssessmentDetail | null>

  findAssessmentForPublish(id: string): Promise<AssessmentForPublishDetail | null>

  findDocumentMediaById(id: string): Promise<Media | null>

  findCourseForPlacement(courseId: string): Promise<{
    id: string
    subject: Subject
    grade: number
    teacherId: string
  } | null>

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

  listTopicsByCourse(courseId: string): Promise<Array<{
    id: string
    name: string
    parentId: string | null
    courseId: string
  }>>

  findSectionInAssessment(assessmentId: string, sectionId: string): Promise<(AssessmentSection & { items: AssessmentItem[] }) | null>

  createSectionItems(data: {
    assessmentId: string
    sectionId: string
    assessmentType: AssessmentType
    items: CreateAssessmentItemDto[]
    courseId?: string | null
  }): Promise<SectionItemDetail[] | null>

  updateSectionItem(data: {
    assessmentId: string
    itemId: string
    item: Partial<CreateAssessmentItemDto>
  }): Promise<SectionItemDetail | null>

  deleteSectionItem(assessmentId: string, itemId: string): Promise<{ id: string; questionId: string | null } | null>

  publishAssessment(id: string): Promise<Assessment>

  updateVisibility(id: string, visibility: AssessmentVisibility): Promise<Assessment>

  createPlacement(data: CreatePlacementDto): Promise<AssessmentPlacement & { assessment: Assessment }>

  upsertSinglePlacement(assessmentId: string, data: Omit<CreatePlacementDto, 'assessmentId'>): Promise<AssessmentPlacement & { assessment: Assessment }>

  deleteSinglePlacement(assessmentId: string): Promise<Assessment | { id: string; visibility: AssessmentVisibility } | null>

  findDuplicatePlacement(data: CreatePlacementDto): Promise<AssessmentPlacement | null>

  findSubmissionForGrading(submissionId: string): Promise<StudentSubmissionComplete | null>

  cloneAssessment(data: {
    assessmentId: string
    createdById: string
    title: string
  }): Promise<Assessment | null>

  gradeEssay(data: {
    submissionId: string
    itemId: string
    teacherScore: number
    teacherNote?: string | null
    gradedBy: string
  }): Promise<SubmissionEssayAnswer>

  finalizeSubmission(submissionId: string, finalScore: number | string): Promise<StudentSubmissionComplete>
}
