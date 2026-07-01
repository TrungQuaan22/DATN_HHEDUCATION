import { BarChart3, CheckCircle2, Clock3, UserRoundX } from "lucide-react";

import type { AdminAssessmentResultsResponse } from "../types";

export function AssessmentResultStats({
  stats,
  maxScore,
}: {
  stats: AdminAssessmentResultsResponse["stats"];
  maxScore: string;
}) {
  const cards = [
    { label: "Tổng học viên", value: stats.totalStudents, icon: BarChart3 },
    { label: "Chưa nộp", value: stats.notStarted, icon: UserRoundX },
    {
      label: "Đang làm / chờ chấm",
      value: stats.doing + stats.pendingGrading,
      icon: Clock3,
    },
    { label: "Đã hoàn thành", value: stats.completed, icon: CheckCircle2 },
  ];

  return (
    <div className="grid overflow-hidden rounded-xl border border-admin-border/30 bg-admin-border/20 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, icon: Icon }) => (
        <div key={label} className="bg-admin-surface-low p-5">
          <div className="flex items-center gap-2 text-xs text-admin-muted">
            <Icon size={15} className="text-admin-pink" aria-hidden="true" />
            {label}
          </div>
          <p className="mt-2 text-2xl font-bold text-admin-cream">{value}</p>
        </div>
      ))}
      <div className="col-span-full flex flex-wrap gap-x-8 gap-y-2 border-t border-admin-border/25 bg-admin-surface-low px-5 py-3 text-xs text-admin-muted">
        <span>
          Điểm cao nhất:{" "}
          <b className="text-admin-cream">
            {stats.highestScore ?? "—"}/{maxScore}
          </b>
        </span>
        <span>
          Thấp nhất:{" "}
          <b className="text-admin-cream">
            {stats.lowestScore ?? "—"}/{maxScore}
          </b>
        </span>
        <span>
          Trung bình:{" "}
          <b className="text-admin-cream">
            {stats.averageScore ?? "—"}/{maxScore}
          </b>
        </span>
      </div>
    </div>
  );
}
