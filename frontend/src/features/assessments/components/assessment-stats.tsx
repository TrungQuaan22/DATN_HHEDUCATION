import React from "react";
import { CheckCircle2, FileText, ListChecks, SquarePen } from "lucide-react";

interface AssessmentStatsProps {
  stats: {
    total: number;
    published: number;
    draft: number;
    pendingGrading: number;
  };
}

export function AssessmentStats({ stats }: AssessmentStatsProps) {
  const cards = [
    { label: "Tổng số đề thi", value: stats.total, icon: ListChecks, color: "text-admin-pink" },
    { label: "Đã xuất bản", value: stats.published, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Bản nháp", value: stats.draft, icon: FileText, color: "text-zinc-400" },
    { label: "Đợi chấm tự luận", value: stats.pendingGrading, icon: SquarePen, color: "text-amber-500" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-admin-border bg-admin-surface-low p-4 flex items-center justify-between shadow-sm"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-admin-muted block mb-1">
              {stat.label}
            </span>
            <div className="text-2xl font-black text-admin-cream">{stat.value}</div>
          </div>
          <stat.icon size={28} className={stat.color} />
        </div>
      ))}
    </div>
  );
}
