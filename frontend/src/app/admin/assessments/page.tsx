"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookOpenCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuthStore } from "@/stores/auth-store";
import { getAdminCourses } from "@/features/courses/api";
import { SUBJECT_LABELS, Subject } from "@/types/common";

import {
  useAdminAssessmentsQuery,
  useAdminGradingSubmissionsQuery,
} from "@/features/assessments/hooks";

import { AssessmentStats } from "@/features/assessments/components/assessment-stats";
import { AssessmentFilterBar } from "@/features/assessments/components/assessment-filter-bar";
import { AssessmentListTable } from "@/features/assessments/components/assessment-list-table";
import { AssessmentListSkeleton } from "@/features/assessments/components/assessment-list-skeleton";
import { EssayGradingSidebar } from "@/features/assessments/components/essay-grading-sidebar";
import { EssayGradingModal } from "@/features/assessments/components/essay-grading-modal";
import { AssessmentCreateModal } from "@/features/assessments/components/assessment-create-modal";

const GRADING_LABELS = {
  auto: "Trắc nghiệm tự động",
  manual: "Tự luận chấm tay",
  mixed: "Hỗn hợp",
};

const toastApiError = (err: any, defaultMsg: string = "Thao tác thất bại.") => {
  console.error("API Error details:", err);
  if (err && typeof err === "object") {
    if (Array.isArray(err.details) && err.details.length > 0) {
      const detailsText = err.details
        .map((d: any) => `${d.field ? `Trường ${d.field}: ` : ""}${d.message}`)
        .join(", ");
      toast.error(`${err.message || defaultMsg} (${detailsText})`);
      return;
    }
    const nestedError = err.response?.data?.error;
    if (nestedError) {
      if (Array.isArray(nestedError.details) && nestedError.details.length > 0) {
        const detailsText = nestedError.details
          .map((d: any) => `${d.field ? `Trường ${d.field}: ` : ""}${d.message}`)
          .join(", ");
        toast.error(`${nestedError.message || defaultMsg} (${detailsText})`);
        return;
      }
      toast.error(nestedError.message || defaultMsg);
      return;
    }
    if (err.message) {
      toast.error(err.message);
      return;
    }
  }
  toast.error(defaultMsg);
};

export default function AdminAssessmentsPage() {
  const router = useRouter();
  const { role } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"public" | "courses" | "unplaced">("public");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [filterGradingType, setFilterGradingType] = useState("");

  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  // Setup Assessment States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 1. Fetch courses list using React Query
  const coursesQuery = useQuery({
    queryKey: ["admin-courses-options"],
    queryFn: () => getAdminCourses({ limit: 100 }),
  });

  const courses = useMemo(() => coursesQuery.data?.items || [], [coursesQuery.data?.items]);

  // Auto-select first course when courses are loaded
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  // 2. Fetch assessments list by backend scope
  const canFetchAssessments = activeTab !== "courses" || Boolean(selectedCourseId);
  const assessmentsQuery = useAdminAssessmentsQuery(
    {
      page: 1,
      limit: 100,
      scope:
        activeTab === "public"
          ? "public"
          : activeTab === "courses"
            ? "course"
            : "unplaced",
      courseId: activeTab === "courses" ? selectedCourseId || undefined : undefined,
      subject: filterSubject || undefined,
      grade: filterGrade ? Number(filterGrade) : undefined,
      gradingType: filterGradingType || undefined,
    },
    { enabled: canFetchAssessments }
  );

  const adminAssessments = useMemo(
    () => assessmentsQuery.data?.items || [],
    [assessmentsQuery.data?.items]
  );

  // 4. Fetch essay grading submissions
  const gradingSubmissionsQuery = useAdminGradingSubmissionsQuery({
    page: 1,
    limit: 100,
  });

  const gradingSubmissions = useMemo(
    () => gradingSubmissionsQuery.data?.items || [],
    [gradingSubmissionsQuery.data?.items]
  );

  // Filter by visible search text only; scope/course filtering happens in backend.
  const filteredAssessments = useMemo(() => {
    return adminAssessments.filter((assessment) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = assessment.title.toLowerCase().includes(query);
        const matchesSubject =
          SUBJECT_LABELS[assessment.subject as Subject]?.toLowerCase().includes(query) ||
          assessment.subject.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSubject) return false;
      }

      return true;
    });
  }, [adminAssessments, searchQuery]);

  // Compute stats
  const stats = useMemo(() => {
    const totalCount = filteredAssessments.length;
    const publishedCount = filteredAssessments.filter((a) => a.visibility === "published").length;
    const draftCount = filteredAssessments.filter((a) => a.visibility === "draft").length;

    return {
      total: totalCount,
      published: publishedCount,
      draft: draftCount,
      pendingGrading: gradingSubmissions.length,
    };
  }, [filteredAssessments, gradingSubmissions]);

  const handleRefreshData = () => {
    assessmentsQuery.refetch();
    gradingSubmissionsQuery.refetch();
  };

  return (
    <div className="space-y-6">
      {/* Upper header block */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-admin-border/60 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-admin-cream tracking-tight flex items-center gap-3">
            <BookOpenCheck className="text-admin-pink" size={32} />
            Quản lý Bài kiểm tra
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-admin-muted">
            Quản lý ngân hàng đề thi tự do, bài tập lộ trình khóa học, bài trắc nghiệm nhanh và cổng
            chấm bài tự luận.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded bg-admin-pink px-4 py-2.5 text-sm font-bold text-admin-bg transition hover:brightness-110 active:scale-95 cursor-pointer"
          >
            <Plus size={15} />
            Soạn thảo đề thi mới
          </button>
        </div>
      </div>

      {/* Info Stats Section */}
      <AssessmentStats stats={stats} />

      {/* Gating Filters & Search */}
      <AssessmentFilterBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCourseId={selectedCourseId}
        setSelectedCourseId={setSelectedCourseId}
        courses={courses}
        isLoadingCourses={coursesQuery.isLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterSubject={filterSubject}
        setFilterSubject={setFilterSubject}
        filterGrade={filterGrade}
        setFilterGrade={setFilterGrade}
        filterGradingType={filterGradingType}
        setFilterGradingType={setFilterGradingType}
        subjectLabels={SUBJECT_LABELS}
        gradingLabels={GRADING_LABELS}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Left main content: Assessment list */}
        {assessmentsQuery.isLoading ? (
          <AssessmentListSkeleton />
        ) : (
          <AssessmentListTable
            assessments={filteredAssessments}
            activeTab={activeTab}
            selectedCourseDetail={null}
            selectedCourseId={selectedCourseId}
            onRefresh={handleRefreshData}
          />
        )}

        {/* Right sidebar: Essay grading queue */}
        <EssayGradingSidebar
          submissions={gradingSubmissions}
          onSelectSubmission={setSelectedSubmissionId}
        />
      </div>

      {/* Essay Grading Modal */}
      {selectedSubmissionId && (
        <EssayGradingModal
          submissionId={selectedSubmissionId}
          onClose={() => {
            setSelectedSubmissionId(null);
            handleRefreshData();
          }}
        />
      )}

      {/* Create Assessment Modal */}
      <AssessmentCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
