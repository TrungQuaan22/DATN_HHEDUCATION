"use client";

import { BookOpen, Clock, Users, CreditCard } from "lucide-react";

type CoursesStatsProps = {
  kpis: {
    active: number;
    draft: number;
    teachers: number;
    monthlyRevenue: number;
  };
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);

export default function CoursesStats({ kpis }: CoursesStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
      {/* Active Courses */}
      <div className="bg-admin-deep p-6 rounded border border-admin-border/30 shadow-sm flex flex-col hover:border-admin-pink/50 transition-all">
        <div className="flex justify-between items-start">
          <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-full">
            <BookOpen className="w-5 h-5" />
          </span>
        </div>
        <div className="mt-4">
          <p className="text-xs font-bold text-admin-muted uppercase tracking-wider">
            Khóa học hoạt động
          </p>
          <p className="text-3xl font-bold text-admin-cream mt-1">
            {kpis.active}
          </p>
        </div>
      </div>

      {/* Draft Courses */}
      <div className="bg-admin-deep p-6 rounded border border-admin-border/30 shadow-sm flex flex-col hover:border-admin-pink/50 transition-all">
        <div className="flex justify-between items-start">
          <span className="p-2 bg-admin-pink/10 text-admin-pink rounded-full">
            <Clock className="w-5 h-5" />
          </span>
        </div>
        <div className="mt-4">
          <p className="text-xs font-bold text-admin-muted uppercase tracking-wider">
            Bản nháp (Draft)
          </p>
          <p className="text-3xl font-bold text-admin-cream mt-1">
            {kpis.draft}
          </p>
        </div>
      </div>

      {/* Teachers */}
      <div className="bg-admin-deep p-6 rounded border border-admin-border/30 shadow-sm flex flex-col hover:border-admin-pink/50 transition-all">
        <div className="flex justify-between items-start">
          <span className="p-2 bg-sky-500/10 text-sky-400 rounded-full">
            <Users className="w-5 h-5" />
          </span>
        </div>
        <div className="mt-4">
          <p className="text-xs font-bold text-admin-muted uppercase tracking-wider">
            Giảng viên phụ trách
          </p>
          <p className="text-3xl font-bold text-admin-cream mt-1">
            {kpis.teachers}
          </p>
        </div>
      </div>

      {/* Revenues */}
      <div className="bg-admin-deep p-6 rounded border border-admin-border/30 shadow-sm flex flex-col hover:border-admin-pink/50 transition-all">
        <div className="flex justify-between items-start">
          <span className="p-2 bg-amber-500/10 text-amber-500 rounded-full">
            <CreditCard className="w-5 h-5" />
          </span>
        </div>
        <div className="mt-4">
          <p className="text-xs font-bold text-admin-muted uppercase tracking-wider">
            Doanh thu tháng (ước tính)
          </p>
          <p className="text-3xl font-bold text-admin-cream mt-1">
            {formatCurrency(kpis.monthlyRevenue)}
          </p>
        </div>
      </div>
    </div>
  );
}

