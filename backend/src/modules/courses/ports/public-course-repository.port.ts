import type { Prisma } from '@prisma/client'

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

export interface PublicCourseRepositoryPort {
  listCatalogCourses(data: {
    where: Prisma.CourseWhereInput
    skip: number
    take: number
    orderBy: Prisma.CourseOrderByWithRelationInput[]
  }): Promise<[CatalogCourseRecord[], number]>
  findPublishedCourseBySlug(slug: string): Promise<CatalogCourseDetailRecord | null>
  listRelatedCatalogCourses(data: {
    courseId: string
    grade: number
    take: number
  }): Promise<CatalogCourseRecord[]>
}
