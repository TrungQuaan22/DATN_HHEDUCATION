import type {
  Assessment,
  AssessmentPlacement,
  Media,
  Subject,
  AssessmentVisibility,
  AssessmentItemType,
  AssessmentType,
  UserRole
} from '@prisma/client'

import type {
  CreateAssessmentItemDto,
  CreateAssessmentDto,
  CreatePlacementDto
} from '../dto'

export interface AdminAssessmentRepositoryPort {
  listAdminAssessments(data: {
    where: any
    skip: number
    take: number
  }): Promise<[any[], number]>

  listGradingSubmissions(data: {
    actor: { id: string; role: UserRole }
    assessmentId?: string
    skip: number
    take: number
  }): Promise<[any[], number]>

  createAssessment(data: CreateAssessmentDto): Promise<Assessment>

  updateAssessment(id: string, data: Partial<CreateAssessmentDto>): Promise<Assessment>

  createSection(data: {
    assessmentId: string
    title: string
    description?: string | null
    itemType: AssessmentItemType
  }): Promise<any>

  updateSection(data: {
    assessmentId: string
    sectionId: string
    title?: string
    description?: string | null
  }): Promise<any>

  deleteSection(assessmentId: string, sectionId: string): Promise<any>

  findAssessmentById(id: string): Promise<any>

  findAssessmentForPublish(id: string): Promise<any>

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

  findSectionInAssessment(assessmentId: string, sectionId: string): Promise<any>

  createSectionItems(data: {
    assessmentId: string
    sectionId: string
    assessmentType: AssessmentType
    items: CreateAssessmentItemDto[]
    courseId?: string | null
  }): Promise<any[] | null>

  updateSectionItem(data: {
    assessmentId: string
    itemId: string
    item: Partial<CreateAssessmentItemDto>
  }): Promise<any>

  deleteSectionItem(assessmentId: string, itemId: string): Promise<any>

  publishAssessment(id: string): Promise<Assessment>

  updateVisibility(id: string, visibility: AssessmentVisibility): Promise<Assessment>

  createPlacement(data: CreatePlacementDto): Promise<any>

  upsertSinglePlacement(assessmentId: string, data: Omit<CreatePlacementDto, 'assessmentId'>): Promise<any>

  deleteSinglePlacement(assessmentId: string): Promise<any>

  findDuplicatePlacement(data: CreatePlacementDto): Promise<AssessmentPlacement | null>

  findSubmissionForGrading(submissionId: string): Promise<any>

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
  }): Promise<any>

  finalizeSubmission(submissionId: string, finalScore: any): Promise<any>
}
