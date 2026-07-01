"use client";

import { GraduationCap, UserPlus, Users } from "lucide-react";

import { ListUsersStats } from "@/features/users/types";

type UsersStatsProps = {
  stats?: ListUsersStats;
};

const emptyStats: ListUsersStats = {
  totalUsers: 0,
  totalTeachers: 0,
  newUsersLast30Days: 0,
};

export default function UsersStats({ stats }: UsersStatsProps) {
  const currentStats = stats ?? emptyStats;

  const items = [
    {
      label: "Tổng người dùng",
      value: currentStats.totalUsers,
      icon: Users,
      className: "bg-sky-500/10 text-sky-400",
    },
    {
      label: "Giáo viên",
      value: currentStats.totalTeachers,
      icon: GraduationCap,
      className: "bg-admin-pink/10 text-admin-pink",
    },
    {
      label: "Thành viên mới 30 ngày",
      value: currentStats.newUsersLast30Days,
      icon: UserPlus,
      className: "bg-emerald-500/10 text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="bg-admin-deep p-5 rounded border border-admin-border/30 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-admin-muted uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-3xl font-bold text-admin-cream mt-2">
                  {item.value}
                </p>
              </div>
              <span className={`p-2 rounded-full ${item.className}`}>
                <Icon className="w-5 h-5" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
