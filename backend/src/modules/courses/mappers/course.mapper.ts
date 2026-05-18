import { mapMediaUrl } from '~/common/mappers/media.mapper'
import { mapUserAvatar } from '~/modules/users/mappers/user.mapper'

import type { CatalogCourseItemDto } from '../dto/public.dto'
import type { courseRepository } from '../repository'

type CatalogCourseSource = Awaited<
  ReturnType<typeof courseRepository.listRelatedCatalogCourses>
>[number]

// Chuyen object key noi bo cua course/teacher thanh URL public cho response API.
// Dau vao la record Prisma con thumbnailObjectKey va teacher.avatarObjectKey.
// Dau ra loai bo object key noi bo, thay bang thumbnailUrl va teacher.avatarUrl.
export const mapCourseMedia = <
  T extends {
    thumbnailObjectKey?: string | null
    teacher: {
      avatarObjectKey?: string | null
    }
  }
>(
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
export const mapAdminCourseResponse = mapCourseMedia

// Mapper cho item catalog public. lessonsCount lay tu Course.totalLessons de tranh join Chapter/Lesson o list API.
export const mapCatalogCourseResponse = (course: CatalogCourseSource): CatalogCourseItemDto => ({
  ...mapCourseMedia({
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    subject: course.subject,
    grade: course.grade,
    teacher: course.teacher,
    thumbnailObjectKey: course.thumbnailObjectKey,
    price: course.price,
    salePrice: course.salePrice,
    status: course.status,
    isFeatured: course.isFeatured,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt
  }),
  lessonsCount: course.totalLessons
})
