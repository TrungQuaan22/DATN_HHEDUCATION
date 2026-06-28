import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";

import type {
  AdminAssessmentResultParticipant,
  AssessmentParticipantStatus,
} from "../types";

const LABELS: Record<AssessmentParticipantStatus, string> = {
  not_started: "Chưa nộp",
  doing: "Đang làm",
  pending_grading: "Chờ chấm",
  completed: "Đã hoàn thành",
};

const STYLES: Record<AssessmentParticipantStatus, string> = {
  not_started: "border-admin-border/40 text-admin-muted",
  doing: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  pending_grading: "border-admin-pink/30 bg-admin-pink/10 text-admin-pink",
  completed: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
};

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

export function AssessmentResultsTable({
  assessmentId,
  items,
  page,
  totalPages,
  totalItems,
  onPageChange,
}: {
  assessmentId: string;
  items: AdminAssessmentResultParticipant[];
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-admin-border/30 bg-admin-surface-low py-12 text-center">
        <SearchX className="mx-auto text-admin-muted" aria-hidden="true" />
        <p className="mt-3 font-semibold text-admin-cream">
          Không có học viên phù hợp
        </p>
        <p className="mt-1 text-sm text-admin-muted">
          Thử thay đổi từ khóa hoặc trạng thái lọc.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-admin-border/30 bg-admin-surface-low">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-admin-border/30 bg-admin-deep/60 text-xs text-admin-muted">
            <tr>
              <th className="px-5 py-3.5">Học viên</th>
              <th className="px-4 py-3.5">Trạng thái</th>
              <th className="px-4 py-3.5">Số lượt</th>
              <th className="px-4 py-3.5">Điểm cao nhất</th>
              <th className="px-4 py-3.5">Nộp gần nhất</th>
              <th className="px-5 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border/20">
            {items.map((item) => (
              <tr key={item.student.id} className="hover:bg-admin-deep/35">
                <td className="px-5 py-4">
                  <p className="font-semibold text-admin-cream">
                    {item.student.fullName}
                  </p>
                  <p className="mt-1 text-xs text-admin-muted">
                    {item.student.email}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-md border px-2 py-1 text-xs font-semibold ${STYLES[item.status]}`}
                  >
                    {LABELS[item.status]}
                  </span>
                </td>
                <td className="px-4 py-4 text-admin-cream">
                  {item.attemptCount}
                </td>
                <td className="px-4 py-4 font-semibold text-admin-cream">
                  {item.bestScore ?? "—"}
                </td>
                <td className="px-4 py-4 text-xs text-admin-muted">
                  {formatDate(item.latestSubmitTime)}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/assessments/${assessmentId}/results/${item.student.id}`}
                    className="inline-flex rounded-md border border-admin-border/30 px-3 py-2 text-xs font-semibold text-admin-cream hover:border-admin-pink/50 hover:text-admin-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-pink/50"
                  >
                    {item.attemptCount ? "Xem bài làm" : "Xem chi tiết"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-admin-border/30 px-5 py-3 text-xs text-admin-muted">
        <span>{totalItems} học viên</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Trang trước"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-md border border-admin-border/30 p-2 disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <span>
            Trang {page}/{Math.max(1, totalPages)}
          </span>
          <button
            type="button"
            aria-label="Trang sau"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-md border border-admin-border/30 p-2 disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
