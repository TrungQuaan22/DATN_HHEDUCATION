import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAdminAssessments,
  listAdminGradingSubmissions,
  getAdminAssessment,
  createAssessment,
  createAssessmentPlacement,
  upsertAssessmentPlacement,
  deleteAssessmentPlacement,
  publishAssessment,
  updateAssessment,
  cloneAssessment,
  gradeEssayAnswer,
  finalizeGradingSubmission,
  listPublicAssessmentPlacements,
  getPublicAssessment,
  getPublicAssessmentBySlug,
  getLearningAssessment,
  startAssessmentAttempt,
  saveAssessmentAnswers,
  submitAssessmentAttempt,
  getAdminGradingSubmission,
  updateAssessmentVisibility,
  listStudentAssessments,
  getAssessmentWorkspace,
} from "./api";
import {
  AssessmentCreatePayload,
  AssessmentPlacementCreatePayload,
  AssessmentPlacementUpsertPayload,
  ListAdminAssessmentsParams,
  SaveAnswerPayload,
  AssessmentSubmission,
} from "./types";
import { toast } from "sonner";

// 1. Admin Queries
export function useAdminAssessmentsQuery(filters?: ListAdminAssessmentsParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["admin-assessments", filters],
    queryFn: () => listAdminAssessments(filters),
    enabled: options?.enabled ?? true,
    placeholderData: (prev) => prev,
  });
}

export function useAdminGradingSubmissionsQuery(params?: {
  page?: number;
  limit?: number;
  assessmentId?: string;
}) {
  return useQuery({
    queryKey: ["admin-grading-submissions", params],
    queryFn: () => listAdminGradingSubmissions(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminGradingSubmissionQuery(submissionId?: string | null) {
  return useQuery({
    queryKey: ["grading-submission", submissionId],
    queryFn: () => getAdminGradingSubmission(submissionId as string),
    enabled: !!submissionId,
  });
}

export function useAdminAssessmentDetailQuery(assessmentId?: string | null) {
  return useQuery({
    queryKey: ["admin-assessment-detail", assessmentId],
    queryFn: () => getAdminAssessment(assessmentId as string),
    enabled: !!assessmentId,
  });
}

// 2. Admin Mutations
export function useCreateAssessmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssessmentCreatePayload) => createAssessment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-assessments"] });
    },
  });
}

export function useUpdateAssessmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assessmentId,
      payload,
    }: {
      assessmentId: string;
      payload: Partial<AssessmentCreatePayload>;
    }) => updateAssessment(assessmentId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-assessments"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-assessment-detail", variables.assessmentId],
      });
    },
  });
}

export function useCreateAssessmentPlacementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssessmentPlacementCreatePayload) => createAssessmentPlacement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-assessments"] });
    },
  });
}

export function useUpsertAssessmentPlacementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assessmentId,
      payload,
    }: {
      assessmentId: string;
      payload: AssessmentPlacementUpsertPayload;
    }) => upsertAssessmentPlacement(assessmentId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-assessments"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-assessment-detail", variables.assessmentId],
      });
    },
  });
}

export function useDeleteAssessmentPlacementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => deleteAssessmentPlacement(assessmentId),
    onSuccess: (_, assessmentId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-assessments"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-assessment-detail", assessmentId],
      });
    },
  });
}

export function usePublishAssessmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => publishAssessment(assessmentId),
    onSuccess: (_, assessmentId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-assessments"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-assessment-detail", assessmentId],
      });
    },
  });
}

export function useUpdateAssessmentVisibilityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assessmentId,
      visibility,
    }: {
      assessmentId: string;
      visibility: "draft" | "published" | "hidden";
    }) => updateAssessmentVisibility(assessmentId, visibility),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-assessments"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-assessment-detail", variables.assessmentId],
      });
    },
  });
}

// 3. Essay Grading Mutations
export function useGradeEssayMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      submissionId,
      payload,
    }: {
      submissionId: string;
      payload: { itemId: string; teacherScore: number; teacherNote?: string | null };
    }) => gradeEssayAnswer(submissionId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["grading-submission", variables.submissionId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-grading-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-assessments"] });
    },
  });
}

export function useFinalizeSubmissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (submissionId: string) => finalizeGradingSubmission(submissionId),
    onSuccess: (_, submissionId) => {
      queryClient.invalidateQueries({
        queryKey: ["grading-submission", submissionId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-grading-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-assessments"] });
    },
  });
}

// 4. Clone Assessment Flow Mutation
export function useCloneAssessmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assessmentId: string) => cloneAssessment(assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-assessments"] });
      toast.success("Nhân bản đề thi thành công!");
    },
    onError: (error: any) => {
      const msg = error instanceof Error ? error.message : "Nhân bản thất bại";
      toast.error(msg);
    },
  });
}

// 5. Public Placements Queries
export function usePublicAssessmentsQuery(filters?: {
  subject?: string;
  grade?: number;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["public-assessments", filters],
    queryFn: () => listPublicAssessmentPlacements(filters),
    placeholderData: (prev) => prev,
  });
}

export function usePublicAssessmentDetailQuery(placementRef: string, options?: { enabled?: boolean }) {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isUuid = uuidPattern.test(placementRef);

  return useQuery({
    queryKey: ["public-assessment-detail", placementRef],
    queryFn: () =>
      isUuid
        ? getPublicAssessment(placementRef)
        : getPublicAssessmentBySlug(placementRef),
    enabled: !!placementRef && (options?.enabled ?? true),
  });
}

// 6. Student/Learning Placements & Attempts Hooks
export function useStudentAssessmentsQuery(params?: {
  subject?: string;
  grade?: number;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["student-assessments", params],
    queryFn: () => listStudentAssessments(params),
    placeholderData: (prev) => prev,
  });
}

export function useLearningAssessmentQuery(placementId?: string | null) {
  return useQuery({
    queryKey: ["learning-assessment", placementId],
    queryFn: () => getLearningAssessment(placementId as string),
    enabled: !!placementId,
  });
}

export function useStartAttemptMutation() {
  const queryClient = useQueryClient();
  return useMutation<AssessmentSubmission, Error, string>({
    mutationFn: (placementId: string) => startAssessmentAttempt(placementId),
    onSuccess: (_, placementId) => {
      queryClient.invalidateQueries({ queryKey: ["learning-assessment", placementId] });
      queryClient.invalidateQueries({ queryKey: ["student-assessments"] });
    },
  });
}

export function useSaveAnswersMutation() {
  return useMutation({
    mutationFn: ({
      submissionId,
      answers,
    }: {
      submissionId: string;
      answers: SaveAnswerPayload[];
    }) => saveAssessmentAnswers(submissionId, answers),
  });
}

export function useSubmitAttemptMutation() {
  const queryClient = useQueryClient();
  return useMutation<AssessmentSubmission, Error, string>({
    mutationFn: (submissionId: string) => submitAssessmentAttempt(submissionId),
    onSuccess: (data) => {
      if (data.placementId) {
        queryClient.invalidateQueries({ queryKey: ["learning-assessment", data.placementId] });
      }
      queryClient.invalidateQueries({ queryKey: ["student-assessments"] });
    },
  });
}

export function useAssessmentWorkspaceQuery(
  placementId?: string | null,
  submissionId?: string | null,
) {
  return useQuery({
    queryKey: ["assessment-workspace", placementId, submissionId],
    queryFn: () => getAssessmentWorkspace(placementId as string, submissionId as string),
    enabled: !!placementId && !!submissionId,
  });
}
