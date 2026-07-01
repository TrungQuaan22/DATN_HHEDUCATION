import { CheckCircle2, CircleDashed, Clock3, Users } from "lucide-react";

import type { ListAdminCourseStudentsResponse } from "../types";

type CourseStudentStatsProps = {
  stats?: ListAdminCourseStudentsResponse["stats"];
  isLoading: boolean;
};

export default function CourseStudentStats({
  stats,
  isLoading,
}: CourseStudentStatsProps) {
  const items = [
    { label: "Tổng học viên", value: stats?.total ?? 0, icon: Users },
    {
      label: "Chưa bắt đầu",
      value: stats?.notStarted ?? 0,
      icon: CircleDashed,
    },
    { label: "Đang học", value: stats?.inProgress ?? 0, icon: Clock3 },
    {
      label: "Hoàn thành",
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
    },
  ];

  return (
    <dl className="grid overflow-hidden rounded-xl border border-admin-border/30 bg-admin-surface-low sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={`flex items-center gap-3 px-5 py-4 ${
              index > 0 ? "border-t border-admin-border/20 sm:border-t-0" : ""
            } ${index % 2 === 1 ? "sm:border-l" : ""} ${
              index >= 2 ? "sm:border-t xl:border-t-0" : ""
            } ${index > 0 ? "xl:border-l" : ""}`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-admin-pink/10 text-admin-pink">
              <Icon size={17} aria-hidden="true" />
            </div>
            <div>
              <dt className="text-xs text-admin-muted">{item.label}</dt>
              <dd className="mt-0.5 text-xl font-bold text-admin-cream">
                {isLoading ? (
                  <span className="inline-block h-6 w-8 animate-pulse rounded bg-admin-border/30" />
                ) : (
                  item.value
                )}
              </dd>
            </div>
          </div>
        );
      })}
    </dl>
  );
}
