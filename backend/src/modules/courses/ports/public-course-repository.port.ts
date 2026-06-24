import type { SubjectValue } from '~/common/constant/taxonomy'
import type { CourseChapterPublic, CourseSummary } from '../dto/course-shared.types'

export type PublicCourseTeacherRecord = {
  id: string
  fullName: string
  avatarObjectKey: string | null
}

export type CatalogCourseRecord = Omit<CourseSummary, 'teacher' | 'thumbnailUrl'> & {
  thumbnailObjectKey: string | null
  teacher: PublicCourseTeacherRecord
}

export type CatalogCourseDetailRecord = CatalogCourseRecord & {
  chapters: CourseChapterPublic[]
}

export type ListCatalogCoursesFilters = {
  subjects?: SubjectValue[]
  featured?: boolean
  grade?: number
  search?: string
}

export type CatalogCourseSort = 'newest' | 'hotest' | 'priceAsc' | 'priceDesc'

export interface PublicCourseRepositoryPort {
  listCatalogCourses(data: {
    filters: ListCatalogCoursesFilters
    sort: CatalogCourseSort
    page: number
    limit: number
  }): Promise<[CatalogCourseRecord[], number]>
  findPublishedCourseBySlug(slug: string): Promise<CatalogCourseDetailRecord | null>
  listRelatedCatalogCourses(data: {
    courseId: string
    grade: number
    limit: number
  }): Promise<CatalogCourseRecord[]>
}
