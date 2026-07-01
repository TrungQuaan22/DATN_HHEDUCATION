import { api } from "@/lib/api/axios";
import {
  AssessmentCreatePayload,
  AssessmentPlacementCreatePayload,
  AssessmentPlacementUpsertPayload,
  AssessmentItemType,
  RuntimeAssessment,
  AdminAssessmentSummary,
  AdminGradingSubmissionSummary,
  AdminGradingSubmissionDetail,
  ListAssessmentPlacementsResponse,
  AssessmentSubmission,
  SaveAnswerPayload,
  AdminAssessmentDetail,
  ListAdminAssessmentsResponse,
  ListAdminGradingSubmissionsResponse,
  ListAdminAssessmentsParams,
  ListStudentAssessmentsResponse,
  StudentAssessmentSummary,
  AssessmentWorkspaceResponse,
  AdminAssessmentResultsResponse,
  AdminAssessmentStudentAttemptsResponse,
  AssessmentParticipantStatus,
  StudentSubmissionResult,
  SubmissionViolationResult,
} from "./types";

type ApiEnvelope<T> = {
  success: true;
  data: T;
};

export const createAssessment = async (payload: AssessmentCreatePayload) => {
  const response = await api.post<ApiEnvelope<{ id: string }>>(
    "/admin/assessments",
    payload,
  );
  return response.data.data;
};

export const createAssessmentSection = async (
  assessmentId: string,
  payload: {
    title: string;
    description?: string | null;
    itemType: AssessmentItemType;
  },
) => {
  const response = await api.post<ApiEnvelope<unknown>>(
    `/admin/assessments/${assessmentId}/sections`,
    payload,
  );
  return response.data.data;
};

export const updateAssessmentSection = async (
  assessmentId: string,
  sectionId: string,
  payload: { title?: string; description?: string | null },
) => {
  const response = await api.patch<ApiEnvelope<unknown>>(
    `/admin/assessments/${assessmentId}/sections/${sectionId}`,
    payload,
  );
  return response.data.data;
};

export const deleteAssessmentSection = async (
  assessmentId: string,
  sectionId: string,
) => {
  const response = await api.delete<ApiEnvelope<unknown>>(
    `/admin/assessments/${assessmentId}/sections/${sectionId}`,
  );
  return response.data.data;
};

export const createAssessmentSectionItems = async (
  assessmentId: string,
  sectionId: string,
  payload: { courseId?: string | null; items: unknown[] },
) => {
  const response = await api.post<ApiEnvelope<unknown[]>>(
    `/admin/assessments/${assessmentId}/sections/${sectionId}/items`,
    payload,
  );
  return response.data.data;
};

export const importAssessmentSectionItems = async (
  assessmentId: string,
  sectionId: string,
  payload: { courseId?: string | null; items: unknown[] },
) => {
  const response = await api.post<ApiEnvelope<unknown[]>>(
    `/admin/assessments/${assessmentId}/sections/${sectionId}/items/import`,
    payload,
  );
  return response.data.data;
};

export const updateAssessmentItem = async (
  assessmentId: string,
  itemId: string,
  payload: Record<string, unknown>,
) => {
  const response = await api.patch<ApiEnvelope<unknown>>(
    `/admin/assessments/${assessmentId}/items/${itemId}`,
    payload,
  );
  return response.data.data;
};

export const deleteAssessmentItem = async (
  assessmentId: string,
  itemId: string,
) => {
  const response = await api.delete<ApiEnvelope<unknown>>(
    `/admin/assessments/${assessmentId}/items/${itemId}`,
  );
  return response.data.data;
};

export const createAssessmentPlacement = async (
  payload: AssessmentPlacementCreatePayload,
) => {
  const response = await api.post<ApiEnvelope<{ id: string }>>(
    "/admin/assessment-placements",
    payload,
  );
  return response.data.data;
};

export const upsertAssessmentPlacement = async (
  assessmentId: string,
  payload: AssessmentPlacementUpsertPayload,
) => {
  const response = await api.put<ApiEnvelope<{ id: string }>>(
    `/admin/assessments/${assessmentId}/placement`,
    payload,
  );
  return response.data.data;
};

export const deleteAssessmentPlacement = async (assessmentId: string) => {
  const response = await api.delete<
    ApiEnvelope<{ assessmentId: string; placementDeleted: boolean }>
  >(`/admin/assessments/${assessmentId}/placement`);
  return response.data.data;
};

export const publishAssessment = async (assessmentId: string) => {
  const response = await api.post<ApiEnvelope<{ id: string }>>(
    `/admin/assessments/${assessmentId}/publish`,
  );
  return response.data.data;
};

export const updateAssessmentVisibility = async (
  assessmentId: string,
  visibility: "draft" | "published" | "hidden",
) => {
  const response = await api.patch<
    ApiEnvelope<{ id: string; visibility: string }>
  >(`/admin/assessments/${assessmentId}/visibility`, { visibility });
  return response.data.data;
};

export const cloneAssessment = async (
  assessmentId: string,
  payload?: { title?: string },
) => {
  const response = await api.post<ApiEnvelope<{ id: string }>>(
    `/admin/assessments/${assessmentId}/clone`,
    payload ?? {},
  );
  return response.data.data;
};

export const listAdminAssessments = async (
  params?: ListAdminAssessmentsParams,
): Promise<ListAdminAssessmentsResponse> => {
  const response = await api.get<ApiEnvelope<ListAdminAssessmentsResponse>>(
    "/admin/assessments",
    { params },
  );
  return response.data.data;
};

export const getAdminAssessment = async (
  assessmentId: string,
): Promise<AdminAssessmentDetail> => {
  const response = await api.get<ApiEnvelope<AdminAssessmentDetail>>(
    `/admin/assessments/${assessmentId}`,
  );
  return response.data.data;
};

export const updateAssessment = async (
  assessmentId: string,
  payload: Partial<AssessmentCreatePayload>,
) => {
  const response = await api.patch<ApiEnvelope<unknown>>(
    `/admin/assessments/${assessmentId}`,
    payload,
  );
  return response.data.data;
};

export const listAdminGradingSubmissions = async (params?: {
  page?: number;
  limit?: number;
  assessmentId?: string;
}): Promise<ListAdminGradingSubmissionsResponse> => {
  const response = await api.get<
    ApiEnvelope<ListAdminGradingSubmissionsResponse>
  >("/admin/assessment-submissions/grading", { params });
  return response.data.data;
};

export const getAdminGradingSubmission = async (
  submissionId: string,
): Promise<AdminGradingSubmissionDetail> => {
  const response = await api.get<ApiEnvelope<AdminGradingSubmissionDetail>>(
    `/admin/assessment-submissions/${submissionId}`,
  );
  return response.data.data;
};

export const listAdminAssessmentResults = async (
  assessmentId: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: AssessmentParticipantStatus;
  },
): Promise<AdminAssessmentResultsResponse> => {
  const response = await api.get<ApiEnvelope<AdminAssessmentResultsResponse>>(
    `/admin/assessments/${assessmentId}/results`,
    { params },
  );
  return response.data.data;
};

export const getAdminAssessmentStudentAttempts = async (
  assessmentId: string,
  studentId: string,
): Promise<AdminAssessmentStudentAttemptsResponse> => {
  const response = await api.get<
    ApiEnvelope<AdminAssessmentStudentAttemptsResponse>
  >(`/admin/assessments/${assessmentId}/students/${studentId}/attempts`);
  return response.data.data;
};

export const gradeEssayAnswer = async (
  submissionId: string,
  payload: {
    itemId: string;
    teacherScore: number;
    teacherNote?: string | null;
  },
) => {
  const response = await api.patch<ApiEnvelope<unknown>>(
    `/admin/assessment-submissions/${submissionId}/essay-score`,
    payload,
  );
  return response.data.data;
};

export const finalizeGradingSubmission = async (
  submissionId: string,
): Promise<AssessmentSubmission> => {
  const response = await api.post<ApiEnvelope<AssessmentSubmission>>(
    `/admin/assessment-submissions/${submissionId}/finalize`,
  );
  return response.data.data;
};

export const getLearningAssessment = async (
  placementId: string,
): Promise<RuntimeAssessment> => {
  const response = await api.get<ApiEnvelope<RuntimeAssessment>>(
    `/learning/assessment-placements/${placementId}`,
  );
  return response.data.data;
};

export const getPublicAssessment = async (
  placementId: string,
): Promise<RuntimeAssessment> => {
  const response = await api.get<ApiEnvelope<RuntimeAssessment>>(
    `/practice/assessment-placements/${placementId}`,
  );
  return response.data.data;
};

export const getPublicAssessmentBySlug = async (
  slug: string,
): Promise<RuntimeAssessment> => {
  const response = await api.get<ApiEnvelope<RuntimeAssessment>>(
    `/practice/assessment-placements/slug/${slug}`,
  );
  return response.data.data;
};

export const listPublicAssessmentPlacements = async (params?: {
  subject?: string;
  grade?: number;
  page?: number;
  limit?: number;
}): Promise<ListAssessmentPlacementsResponse> => {
  const response = await api.get<ApiEnvelope<ListAssessmentPlacementsResponse>>(
    "/practice/assessments",
    { params },
  );
  return response.data.data;
};

export const startAssessmentAttempt = async (
  placementId: string,
): Promise<AssessmentSubmission> => {
  const response = await api.post<ApiEnvelope<AssessmentSubmission>>(
    `/learning/assessment-placements/${placementId}/attempts`,
  );
  return response.data.data;
};

export const saveAssessmentAnswers = async (
  submissionId: string,
  answers: SaveAnswerPayload[],
) => {
  const response = await api.put<
    ApiEnvelope<{ submissionId: string; saved: boolean }>
  >(`/learning/assessment-submissions/${submissionId}/answers`, { answers });
  return response.data.data;
};

export const submitAssessmentAttempt = async (
  submissionId: string,
): Promise<AssessmentSubmission> => {
  const response = await api.post<ApiEnvelope<AssessmentSubmission>>(
    `/learning/assessment-submissions/${submissionId}/submit`,
  );
  return response.data.data;
};

export const recordAssessmentViolation = async (
  submissionId: string,
): Promise<SubmissionViolationResult> => {
  const response = await api.post<ApiEnvelope<SubmissionViolationResult>>(
    `/learning/assessment-submissions/${submissionId}/violations`,
  );
  return response.data.data;
};

export const listStudentAssessments = async (params?: {
  subject?: string;
  grade?: number;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ListStudentAssessmentsResponse> => {
  const response = await api.get<ApiEnvelope<ListStudentAssessmentsResponse>>(
    "/learning/assessments",
    { params },
  );
  return response.data.data;
};

export const getAssessmentWorkspace = async (
  placementId: string,
  submissionId: string,
): Promise<AssessmentWorkspaceResponse> => {
  const response = await api.get<ApiEnvelope<AssessmentWorkspaceResponse>>(
    `/learning/assessment-placements/${placementId}/workspace`,
    { params: { submissionId } },
  );
  return response.data.data;
};

export const getStudentSubmissionResult = async (
  submissionId: string,
): Promise<StudentSubmissionResult> => {
  const response = await api.get<ApiEnvelope<StudentSubmissionResult>>(
    `/learning/assessment-submissions/${submissionId}/result`,
  );
  return response.data.data;
};
