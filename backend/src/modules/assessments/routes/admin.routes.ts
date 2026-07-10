import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { asyncHandler } from '~/common/middlewares/async-handler'
import { requireAuth } from '~/common/middlewares/require-auth'
import { requireRole } from '~/common/middlewares/require-role'
import { validateRequest } from '~/common/middlewares/validate-request'

import {
  cloneAssessmentController,
  createAssessmentController,
  createSectionController,
  createSectionItemsController,
  updateAssessmentController,
  updateSectionController,
  updateSectionItemController,
  deleteSectionController,
  deleteSectionItemController,
  importSectionItemsController,
  createPlacementController,
  deletePlacementController,
  finalizeManualSubmissionController,
  gradeEssayController,
  getGradingSubmissionController,
  listAdminAssessmentsController,
  getAdminAssessmentController,
  listGradingSubmissionsController,
  publishAssessmentController,
  updateVisibilityController,
  upsertPlacementController
} from '../controllers/admin.controller'
import {
  assessmentIdSchema,
  cloneAssessmentSchema,
  createAssessmentSchema,
  createAssessmentItemsSchema,
  createAssessmentSectionSchema,
  updateAssessmentSchema,
  updateAssessmentItemSchema,
  updateAssessmentSectionSchema,
  deleteAssessmentItemSchema,
  deleteAssessmentSectionSchema,
  createPlacementSchema,
  finalizeManualSubmissionSchema,
  gradeEssaySchema,
  listAdminAssessmentsSchema,
  listGradingSubmissionsSchema,
  submissionIdSchema,
  updateAssessmentVisibilitySchema,
  upsertPlacementSchema
} from '../validators/assessment.validator'
import {
  getAssessmentStudentAttemptsSchema,
  listAssessmentResultsSchema
} from '../validators/admin-assessment-results.validator'
import {
  getAssessmentStudentAttemptsController,
  listAssessmentResultsController
} from '../controllers/admin-results.controller'

export const adminAssessmentRoutes = Router()

// API cho admin/teacher xem danh sách assessment trong trang quản trị.
adminAssessmentRoutes.get(
  '/assessments',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(listAdminAssessmentsSchema),
  asyncHandler(listAdminAssessmentsController)
)

// API lấy chi tiết assessment để xem/sửa cấu trúc, section, item và placement.
adminAssessmentRoutes.get(
  '/assessments/:assessmentId',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(assessmentIdSchema),
  asyncHandler(getAdminAssessmentController)
)

// API xem bảng kết quả tổng hợp của một assessment.
adminAssessmentRoutes.get(
  '/assessments/:assessmentId/results',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(listAssessmentResultsSchema),
  asyncHandler(listAssessmentResultsController)
)

// API xem toàn bộ các lần làm của một học sinh trong assessment.
adminAssessmentRoutes.get(
  '/assessments/:assessmentId/students/:studentId/attempts',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(getAssessmentStudentAttemptsSchema),
  asyncHandler(getAssessmentStudentAttemptsController)
)

// API tạo assessment mới, ban đầu ở trạng thái draft.
adminAssessmentRoutes.post(
  '/assessments',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(createAssessmentSchema),
  asyncHandler(createAssessmentController)
)

// API cập nhật thông tin chung của assessment.
adminAssessmentRoutes.patch(
  '/assessments/:assessmentId',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(updateAssessmentSchema),
  asyncHandler(updateAssessmentController)
)

// API tạo section/phần câu hỏi trong assessment.
adminAssessmentRoutes.post(
  '/assessments/:assessmentId/sections',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(createAssessmentSectionSchema),
  asyncHandler(createSectionController)
)

// API cập nhật tiêu đề hoặc mô tả section.
adminAssessmentRoutes.patch(
  '/assessments/:assessmentId/sections/:sectionId',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(updateAssessmentSectionSchema),
  asyncHandler(updateSectionController)
)

// API xóa section khi section chưa có item và assessment chưa bị khóa.
adminAssessmentRoutes.delete(
  '/assessments/:assessmentId/sections/:sectionId',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(deleteAssessmentSectionSchema),
  asyncHandler(deleteSectionController)
)

// API thêm item/câu hỏi vào section.
adminAssessmentRoutes.post(
  '/assessments/:assessmentId/sections/:sectionId/items',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(createAssessmentItemsSchema),
  asyncHandler(createSectionItemsController)
)

// API import nhiều item/câu hỏi vào section.
adminAssessmentRoutes.post(
  '/assessments/:assessmentId/sections/:sectionId/items/import',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(createAssessmentItemsSchema),
  asyncHandler(importSectionItemsController)
)

// API cập nhật một item/câu hỏi trong assessment.
adminAssessmentRoutes.patch(
  '/assessments/:assessmentId/items/:itemId',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(updateAssessmentItemSchema),
  asyncHandler(updateSectionItemController)
)

// API xóa một item/câu hỏi khỏi assessment.
adminAssessmentRoutes.delete(
  '/assessments/:assessmentId/items/:itemId',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(deleteAssessmentItemSchema),
  asyncHandler(deleteSectionItemController)
)

// API publish assessment sau khi nội dung và placement hợp lệ.
adminAssessmentRoutes.post(
  '/assessments/:assessmentId/publish',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(assessmentIdSchema),
  asyncHandler(publishAssessmentController)
)

// API đổi visibility của assessment: draft, published hoặc hidden.
adminAssessmentRoutes.patch(
  '/assessments/:assessmentId/visibility',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(updateAssessmentVisibilitySchema),
  asyncHandler(updateVisibilityController)
)

// API clone assessment để tạo bản sao chỉnh sửa độc lập.
adminAssessmentRoutes.post(
  '/assessments/:assessmentId/clone',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(cloneAssessmentSchema),
  asyncHandler(cloneAssessmentController)
)

// API gắn hoặc cập nhật placement chính của assessment vào course/lesson/public.
adminAssessmentRoutes.put(
  '/assessments/:assessmentId/placement',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(upsertPlacementSchema),
  asyncHandler(upsertPlacementController)
)

// API xóa placement chính của assessment.
adminAssessmentRoutes.delete(
  '/assessments/:assessmentId/placement',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(assessmentIdSchema),
  asyncHandler(deletePlacementController)
)

// API tạo placement mới theo payload có assessmentId.
adminAssessmentRoutes.post(
  '/assessment-placements',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(createPlacementSchema),
  asyncHandler(createPlacementController)
)

// API liệt kê các submission đang cần giáo viên chấm.
adminAssessmentRoutes.get(
  '/assessment-submissions/grading',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(listGradingSubmissionsSchema),
  asyncHandler(listGradingSubmissionsController)
)

// API lấy chi tiết submission để giáo viên chấm bài.
adminAssessmentRoutes.get(
  '/assessment-submissions/:submissionId',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(submissionIdSchema),
  asyncHandler(getGradingSubmissionController)
)

// API chấm điểm một câu tự luận trong submission.
adminAssessmentRoutes.patch(
  '/assessment-submissions/:submissionId/essay-score',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(gradeEssaySchema),
  asyncHandler(gradeEssayController)
)

// API chốt điểm cuối cùng sau khi đã chấm xong phần tự luận.
adminAssessmentRoutes.post(
  '/assessment-submissions/:submissionId/finalize',
  requireAuth,
  requireRole(UserRole.admin, UserRole.teacher),
  validateRequest(finalizeManualSubmissionSchema),
  asyncHandler(finalizeManualSubmissionController)
)
