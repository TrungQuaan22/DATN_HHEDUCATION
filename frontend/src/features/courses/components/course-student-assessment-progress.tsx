import Link from "next/link";
import { ClipboardCheck, ExternalLink } from "lucide-react";

import type { AdminCourseStudentProgress } from "../types";
import { formatAdminDate } from "../utils/course-student-presenter";

type Props = {
  studentId: string;
  assessments: AdminCourseStudentProgress["assessments"];
};

const STATUS_LABELS = {
  not_started: "Chưa nộp",
  doing: "Đang làm",
  pending_grading: "Chờ chấm",
  completed: "Đã hoàn thành",
};

const STATUS_STYLES = {
  not_started: "border-admin-border/40 text-admin-muted",
  doing: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  pending_grading: "border-admin-pink/30 bg-admin-pink/10 text-admin-pink",
  completed: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
};

export default function CourseStudentAssessmentProgress({
  studentId,
  assessments,
}: Props) {
  if (assessments.length === 0) {
    return (
      <div className="rounded-xl border border-admin-border/30 bg-admin-surface-low px-6 py-12 text-center">
        <ClipboardCheck
          className="mx-auto text-admin-muted"
          aria-hidden="true"
        />
        <h3 className="mt-3 font-semibold text-admin-cream">
          Khóa học chưa có bài kiểm tra
        </h3>
        <p className="mt-1 text-sm text-admin-muted">
          Các đề được gán trực tiếp cho khóa học hoặc bài học sẽ xuất hiện tại
          đây.
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
              <th className="px-5 py-3.5 font-semibold">Bài kiểm tra</th>
              <th className="px-4 py-3.5 font-semibold">Trạng thái</th>
              <th className="px-4 py-3.5 font-semibold">Số lượt làm</th>
              <th className="px-4 py-3.5 font-semibold">Điểm cao nhất</th>
              <th className="px-4 py-3.5 font-semibold">Nộp gần nhất</th>
              <th className="px-5 py-3.5 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border/20">
            {assessments.map((assessment) => (
              <tr key={assessment.id} className="hover:bg-admin-deep/35">
                <td className="px-5 py-4">
                  <p className="font-semibold text-admin-cream">
                    {assessment.title}
                  </p>
                  <p className="mt-1 text-xs text-admin-muted">
                    Thang điểm {assessment.maxScore}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${STATUS_STYLES[assessment.status]}`}
                  >
                    {STATUS_LABELS[assessment.status]}
                  </span>
                </td>
                <td className="px-4 py-4 text-admin-cream">
                  {assessment.attemptCount}
                  {assessment.maxAttempts ? `/${assessment.maxAttempts}` : ""}
                </td>
                <td className="px-4 py-4 font-semibold text-admin-cream">
                  {assessment.bestScore ?? "—"}
                </td>
                <td className="px-4 py-4 text-xs text-admin-muted">
                  {formatAdminDate(assessment.latestSubmitTime)}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/assessments/${assessment.id}/results/${studentId}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-admin-border/30 px-3 py-2 text-xs font-semibold text-admin-cream hover:border-admin-pink/50 hover:text-admin-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-pink/50"
                  >
                    Xem bài làm
                    <ExternalLink size={13} aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
