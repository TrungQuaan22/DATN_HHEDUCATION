import {
  CheckCircle2,
  CircleDashed,
  CircleX,
  Gauge,
  Split,
} from "lucide-react";

import type { StudentSubmissionResult } from "../types";

export function SubmissionResultSummary({
  result,
}: {
  result: StudentSubmissionResult;
}) {
  const summary = result.summary;
  if (!summary) return null;

  const metrics = [
    {
      label: "Đúng",
      value: summary.correctItems,
      icon: CheckCircle2,
      color: "text-emerald-300",
    },
    {
      label: "Đúng một phần",
      value: summary.partialItems,
      icon: Split,
      color: "text-amber-300",
    },
    {
      label: "Sai",
      value: summary.incorrectItems,
      icon: CircleX,
      color: "text-red-300",
    },
    {
      label: "Chưa trả lời",
      value: summary.unansweredItems,
      icon: CircleDashed,
      color: "text-admin-muted",
    },
  ];

  return (
    <section className="overflow-hidden rounded-xl border border-admin-border/30 bg-admin-surface-low">
      <div className="flex flex-col gap-4 border-b border-admin-border/25 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-admin-muted">
            Kết quả lượt {result.attempt.attemptNumber}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-admin-cream">
              {result.attempt.finalScore ?? result.attempt.autoScore ?? "0"}
            </span>
            <span className="text-sm font-semibold text-admin-muted">
              / {result.assessment.maxScore} điểm
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-admin-pink/25 bg-admin-pink/10 px-3 py-2 text-sm font-semibold text-admin-pink">
          <Gauge size={16} aria-hidden="true" />
          {summary.totalItems} câu hỏi
        </div>
      </div>
      <div className="grid gap-px bg-admin-border/20 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="flex items-center gap-3 bg-admin-surface-low px-5 py-4"
          >
            <Icon size={18} className={color} aria-hidden="true" />
            <div>
              <p className="text-xs text-admin-muted">{label}</p>
              <p className="text-lg font-bold text-admin-cream">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
