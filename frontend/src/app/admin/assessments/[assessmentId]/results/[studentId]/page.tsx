"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileSearch } from "lucide-react";
import { useState } from "react";

import { EssayGradingModal } from "@/features/assessments/components/essay-grading-modal";
import { useAdminAssessmentStudentAttemptsQuery } from "@/features/assessments/hooks";

const STATUS_LABELS = {
  doing: "Đang làm",
  submitted: "Chờ chấm",
  auto_submitted: "Tự động nộp",
  completed: "Đã hoàn thành",
};

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

export default function AdminAssessmentStudentAttemptsPage() {
  const { assessmentId, studentId } = useParams<{
    assessmentId: string;
    studentId: string;
  }>();
  const query = useAdminAssessmentStudentAttemptsQuery(assessmentId, studentId);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/admin/assessments/${assessmentId}/results`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-admin-muted hover:text-admin-pink"
        >
          <ArrowLeft size={15} aria-hidden="true" /> Kết quả bài kiểm tra
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-admin-cream">
          Chi tiết bài làm
        </h1>
      </div>

      {query.isLoading ? (
        <div className="h-56 animate-pulse rounded-xl bg-admin-surface-low" />
      ) : query.isError || !query.data ? (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-5 text-sm text-red-300">
          Không thể tải lịch sử làm bài.
        </div>
      ) : (
        <>
          <section className="rounded-xl border border-admin-border/30 bg-admin-surface-low p-5">
            <h2 className="text-lg font-bold text-admin-cream">
              {query.data.participant.student.fullName}
            </h2>
            <p className="text-sm text-admin-muted">
              {query.data.participant.student.email}
            </p>
            <div className="mt-4 flex flex-wrap gap-6 text-sm">
              <span className="text-admin-muted">
                Đề:{" "}
                <b className="text-admin-cream">
                  {query.data.assessment.title}
                </b>
              </span>
              <span className="text-admin-muted">
                Số lượt:{" "}
                <b className="text-admin-cream">
                  {query.data.participant.attemptCount}
                </b>
              </span>
              <span className="text-admin-muted">
                Điểm cao nhất:{" "}
                <b className="text-admin-cream">
                  {query.data.participant.bestScore ?? "—"}/
                  {query.data.assessment.maxScore}
                </b>
              </span>
            </div>
          </section>

          {query.data.attempts.length === 0 ? (
            <div className="rounded-xl border border-admin-border/30 bg-admin-surface-low py-12 text-center">
              <FileSearch
                className="mx-auto text-admin-muted"
                aria-hidden="true"
              />
              <p className="mt-3 font-semibold text-admin-cream">
                Học viên chưa nộp bài
              </p>
              <p className="mt-1 text-sm text-admin-muted">
                Chưa có submission nào cho bài kiểm tra này.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-admin-border/30 bg-admin-surface-low">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-admin-border/30 bg-admin-deep/60 text-xs text-admin-muted">
                  <tr>
                    <th className="px-5 py-3.5">Lượt làm</th>
                    <th className="px-4 py-3.5">Trạng thái</th>
                    <th className="px-4 py-3.5">Thời gian nộp</th>
                    <th className="px-4 py-3.5">Điểm</th>
                    <th className="px-5 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border/20">
                  {[...query.data.attempts].reverse().map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-admin-deep/35">
                      <td className="px-5 py-4 font-semibold text-admin-cream">
                        Lần {attempt.attemptNumber}
                      </td>
                      <td className="px-4 py-4 text-admin-muted">
                        {STATUS_LABELS[attempt.status]}
                      </td>
                      <td className="px-4 py-4 text-xs text-admin-muted">
                        {formatDate(attempt.submitTime)}
                      </td>
                      <td className="px-4 py-4 font-semibold text-admin-cream">
                        {attempt.finalScore ?? attempt.autoScore ?? "—"}/
                        {query.data.assessment.maxScore}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {attempt.status !== "doing" && (
                          <button
                            type="button"
                            onClick={() => setSelectedSubmissionId(attempt.id)}
                            className="rounded-md border border-admin-border/30 px-3 py-2 text-xs font-semibold text-admin-cream hover:border-admin-pink/50 hover:text-admin-pink"
                          >
                            {attempt.status === "submitted"
                              ? "Chấm bài"
                              : "Xem bài làm"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {selectedSubmissionId && (
        <EssayGradingModal
          submissionId={selectedSubmissionId}
          onClose={() => {
            setSelectedSubmissionId(null);
            query.refetch();
          }}
        />
      )}
    </div>
  );
}
