"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Edit, Copy, RefreshCw, ListChecks } from "lucide-react";
import { AdminAssessmentSummary } from "../types";
import { AdminCourseDetail } from "@/features/courses/types";
import { useCloneAssessmentMutation } from "../hooks";
import { SUBJECT_LABELS, Subject } from "@/types/common";

type GradingType = "auto" | "manual" | "mixed";

const GRADING_LABELS: Record<GradingType, string> = {
  auto: "Trắc nghiệm tự động",
  manual: "Tự luận chấm tay",
  mixed: "Hỗn hợp",
};

interface AssessmentListTableProps {
  assessments: AdminAssessmentSummary[];
  activeTab: "public" | "courses" | "unplaced";
  selectedCourseDetail: AdminCourseDetail | null;
  selectedCourseId: string;
  onRefresh: () => void;
}

export function AssessmentListTable({
  assessments,
  activeTab,
  selectedCourseDetail,
  selectedCourseId,
  onRefresh,
}: AssessmentListTableProps) {
  const router = useRouter();
  const cloneMutation = useCloneAssessmentMutation();
  const listTitle =
    activeTab === "public"
      ? "tự do"
      : activeTab === "unplaced"
        ? "chưa phân bổ"
        : "khóa học";

  const getPlacementLabel = (assessment: AdminAssessmentSummary) => {
    const p = assessment.placements.find(
      (pl) => pl.type === "course" || pl.type === "lesson",
    );
    if (!p) return "Chưa phân bổ";
    if (p.type === "course") return "Lộ trình khóa học";
    if (p.type === "lesson" && selectedCourseDetail) {
      for (const ch of selectedCourseDetail.chapters) {
        const lesson = ch.lessons.find((l) => l.id === p.lessonId);
        if (lesson) {
          return `Bài học: ${lesson.title}`;
        }
      }
      return "Bài trắc nghiệm";
    }
    return "Khóa học khác";
  };

  const handleClone = async (assessmentId: string) => {
    try {
      await cloneMutation.mutateAsync(assessmentId);
      onRefresh(); // Refresh list after successful clone
    } catch (error) {
      // Toast notification is already handled inside hook's onError
      console.error("Lỗi nhân bản:", error);
    }
  };

  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface-low overflow-hidden shadow-sm">
      <div className="flex items-center justify-between border-b border-admin-border/60 px-5 py-4">
        <h3 className="text-sm font-bold text-admin-cream flex items-center gap-2">
          <ListChecks size={16} className="text-admin-pink" />
          Danh sách đề thi {listTitle} ({assessments.length})
        </h3>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 rounded-md border border-admin-border bg-admin-bg px-3 py-1.5 text-xs font-bold text-admin-cream transition hover:border-admin-pink cursor-pointer"
        >
          <RefreshCw size={12} />
          Tải lại
        </button>
      </div>

      <div className="divide-y divide-admin-border/60">
        {assessments.length === 0 ? (
          <div className="p-12 text-center text-sm text-admin-muted">
            {activeTab === "courses" && !selectedCourseId
              ? "Vui lòng chọn khóa học để xem danh sách bài kiểm tra."
              : "Chưa có đề thi nào trong mục này."}
          </div>
        ) : (
          assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="grid gap-4 items-center p-5 md:grid-cols-[1fr_auto_140px] hover:bg-admin-bg/20 transition-colors"
            >
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap gap-2 items-center">
                  <span className="rounded bg-admin-pink/15 px-2.5 py-0.5 text-xs font-bold uppercase text-admin-pink">
                    {SUBJECT_LABELS[assessment.subject as Subject] ||
                      assessment.subject}{" "}
                    - Lớp {assessment.grade}
                  </span>
                  <span className="rounded bg-admin-bg border border-admin-border px-2 py-0.5 text-xs font-bold uppercase text-admin-cream">
                    {GRADING_LABELS[assessment.gradingType as GradingType] ||
                      assessment.gradingType}
                  </span>
                  {assessment.visibility === "draft" ? (
                    <span className="rounded bg-zinc-800 text-zinc-400 px-2 py-0.5 text-xs font-bold">
                      Bản nháp
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 text-xs font-bold">
                      Đã xuất bản
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-admin-cream truncate">
                  {assessment.title}
                </h4>
                <p className="mt-1 text-xs text-admin-muted">
                  {assessment.itemCount} câu hỏi | {assessment.submissionCount}{" "}
                  lượt làm bài | Thời gian:{" "}
                  {assessment.timeLimitMinutes || "Tự do"} phút
                </p>
              </div>

              <div className="text-xs font-bold text-admin-muted">
                {activeTab === "courses" && (
                  <span className="rounded bg-admin-deep border border-admin-border px-3 py-1 text-admin-cream">
                    {getPlacementLabel(assessment)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/assessments/builder?id=${assessment.id}`,
                    )
                  }
                  className="inline-flex items-center gap-1 rounded bg-admin-deep hover:bg-admin-pink/15 hover:text-admin-pink border border-admin-border px-3 py-1.5 text-xs font-bold text-admin-cream transition active:scale-95"
                >
                  <Edit size={12} />
                  Sửa
                </button>
                <button
                  type="button"
                  disabled={cloneMutation.isPending}
                  onClick={() => handleClone(assessment.id)}
                  className="inline-flex items-center gap-1 rounded bg-admin-deep hover:border-admin-pink/40 border border-admin-border px-3 py-1.5 text-xs font-bold text-admin-cream transition active:scale-95 disabled:opacity-50"
                >
                  <Copy size={12} />
                  {cloneMutation.isPending ? "Đang sao chép..." : "Nhân bản"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

