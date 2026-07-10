import { AssessmentPlacementType, LessonType, Subject, UserRole } from '@prisma/client'

import { ERROR_CODE } from '~/common/constant/error-code'
import { AppError } from '~/common/error/app-error'

import type { CreatePlacementDto } from '../dto'

// Đảm bảo teacher chỉ dùng course mình quản lý.
export function validateTeacherOwnsCourse(
  actor: { id: string; role: UserRole },
  course: { teacherId: string } | null
): void {
  if (actor.role === UserRole.admin) {
    return
  }

  if (!course || course.teacherId !== actor.id) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only use courses you manage')
  }
}

// Đảm bảo câu hỏi của assessment khớp môn/lớp và topic của course.
export function validateCourseTopics(
  assessment: { subject: Subject; grade: number },
  items: Array<{ topicId?: string | null; topicName?: string | null }>,
  course: { subject: Subject; grade: number } | null,
  courseTopics: Array<{ id: string }>
): void {
  if (!course) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Course not found')
  }

  if (course.subject !== assessment.subject || course.grade !== assessment.grade) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Assessment subject/grade must match course')
  }

  const topicIds = items
    .map((item) => item.topicId)
    .filter((topicId): topicId is string => Boolean(topicId))
  const courseTopicIds = new Set(courseTopics.map((topic) => topic.id))

  if (topicIds.some((topicId) => !courseTopicIds.has(topicId))) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Topic must belong to assessment course')
  }
}

// Kiểm tra assessment được gắn đúng target: public, course hoặc quiz lesson.
export function validatePlacementTarget(
  actor: { id: string; role: UserRole },
  assessment: { subject: Subject; grade: number },
  data: CreatePlacementDto,
  course: { teacherId: string; subject: Subject; grade: number } | null,
  lesson: {
    type: string
    chapter: { course: { teacherId: string; subject: Subject; grade: number } }
  } | null
): void {
  if (data.openTime && data.closeTime && new Date(data.openTime) >= new Date(data.closeTime)) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'openTime must be earlier than closeTime')
  }

  if (data.type === AssessmentPlacementType.public_practice) {
    if (actor.role === UserRole.teacher) {
      throw new AppError(
        403,
        ERROR_CODE.FORBIDDEN,
        'Teachers cannot publish assessments to public practice'
      )
    }

    if (data.courseId || data.lessonId) {
      throw new AppError(
        400,
        ERROR_CODE.BAD_REQUEST,
        'Public practice placement cannot bind course or lesson'
      )
    }

    if (!data.slug) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Public practice placement requires slug')
    }
    return
  }

  if (data.type === AssessmentPlacementType.course) {
    if (!data.courseId) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Course placement requires courseId')
    }
    if (data.lessonId) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Course placement cannot bind lessonId')
    }
    if (!course) {
      throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Course not found')
    }
    if (actor.role === UserRole.teacher && course.teacherId !== actor.id) {
      throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only assign assessments to your courses')
    }
    if (course.subject !== assessment.subject || course.grade !== assessment.grade) {
      throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Assessment subject/grade must match course')
    }
    return
  }

  if (!data.lessonId) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Lesson placement requires lessonId')
  }
  if (data.courseId) {
    throw new AppError(
      400,
      ERROR_CODE.BAD_REQUEST,
      'Lesson placement derives course access from lesson'
    )
  }
  if (!lesson) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, 'Lesson not found')
  }
  if (lesson.type !== LessonType.quiz) {
    throw new AppError(400, ERROR_CODE.BAD_REQUEST, 'Lesson placement requires a quiz lesson')
  }

  const lessonCourse = lesson.chapter.course
  if (actor.role === UserRole.teacher && lessonCourse.teacherId !== actor.id) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'You can only assign assessments to your lessons')
  }
  if (lessonCourse.subject !== assessment.subject || lessonCourse.grade !== assessment.grade) {
    throw new AppError(
      400,
      ERROR_CODE.BAD_REQUEST,
      'Assessment subject/grade must match lesson course'
    )
  }
}

// Kiểm tra assessment placement đã mở và chưa đóng.
export function validatePlacementAvailable(placement: {
  openTime: Date | null
  closeTime: Date | null
}): void {
  const now = new Date()

  if (placement.openTime && placement.openTime > now) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'Assessment is not open yet')
  }
  if (placement.closeTime && placement.closeTime < now) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'Assessment is closed')
  }
}

// Kiểm tra user có quyền truy cập placement dựa trên đăng nhập và enrollment.
export function validatePlacementAccess(
  userId: string | undefined,
  placement: {
    type: AssessmentPlacementType
    openTime: Date | null
    closeTime: Date | null
  },
  enrollment: unknown | null
): void {
  validatePlacementAvailable(placement)

  if (!userId) {
    throw new AppError(401, ERROR_CODE.UNAUTHORIZED, 'Authentication required')
  }
  if (placement.type !== AssessmentPlacementType.public_practice && !enrollment) {
    throw new AppError(403, ERROR_CODE.FORBIDDEN, 'Assessment requires course enrollment')
  }
}

// Kiểm tra user còn quyền thao tác trên submission theo placement hiện tại.
export function validateSubmissionAccess(
  userId: string,
  submission: {
    placement: {
      type: AssessmentPlacementType
      openTime: Date | null
      closeTime: Date | null
    } | null
  },
  enrollment: unknown | null
): void {
  if (submission.placement) {
    validatePlacementAccess(userId, submission.placement, enrollment)
  }
}
