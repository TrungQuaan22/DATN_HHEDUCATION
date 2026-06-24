"use client";

import React from "react";
import { Trophy } from "lucide-react";

interface AssessmentStatsProps {
  stats: {
    total: number;
    completed: number;
    notDone: number;
    expired: number;
    averageGPA: string;
  };
}

export function AssessmentStats({ stats }: AssessmentStatsProps) {
  return (
    <div className="lg:col-span-4 space-y-6">
      {/* GPA Card */}
      <div className="bg-deep-black rounded p-6 border border-border-dark space-y-5">
        <h3 className="text-sm font-bold text-cream flex items-center gap-2 border-b border-border-dark/40 pb-3">
          <Trophy size={16} className="text-brand-pink" />
          Tổng kết kết quả
        </h3>

        <div className="flex flex-col items-center justify-center p-6 rounded bg-brand-dark border border-border-dark space-y-2 relative overflow-hidden group">
          <div className="absolute w-24 h-24 bg-brand-pink/5 rounded-full blur-2xl group-hover:bg-brand-pink/10 transition-colors duration-300"></div>
          <span className="text-xs font-bold text-muted-text uppercase tracking-wider">
            GPA Trung bình thi
          </span>
          <span className="text-5xl font-extrabold text-brand-pink leading-none drop-shadow-[0_0_15px_rgba(255,105,180,0.3)]">
            {stats.averageGPA}
          </span>
          <span className="text-xs text-muted-text font-semibold text-center">
            tính trên các bài thi chính thức (thang 10)
          </span>
        </div>

        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-muted-text">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span>Đã hoàn thành</span>
            </div>
            <span className="text-cream font-bold">
              {stats.completed} bài
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-muted-text">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-pink"></div>
              <span>Chưa làm / Chờ mở</span>
            </div>
            <span className="text-cream font-bold">
              {stats.notDone} bài
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-muted-text">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <span>Trễ hạn</span>
            </div>
            <span className="text-red-400 font-bold">
              {stats.expired} bài
            </span>
          </div>
        </div>

        <div className="border-t border-border-dark/40 pt-4 text-center">
          <div className="text-xs text-muted-text leading-relaxed">
            Tích cực hoàn thiện các bài thi đúng hạn để nâng cao điểm trung
            bình GPA nhé!
          </div>
        </div>
      </div>

      {/* Subject Breakdown Card */}
      <div className="bg-deep-black rounded p-6 border border-border-dark space-y-4">
        <h3 className="text-sm font-bold text-cream border-b border-border-dark/40 pb-3">
          Môn học của bạn
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cream">Ngữ Văn</span>
            <span className="text-xs font-bold text-brand-pink">
              GPA: 8.80
            </span>
          </div>
          <div className="w-full h-1 bg-brand-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-pink"
              style={{ width: "88%" }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-cream">Toán Học</span>
            <span className="text-xs font-bold text-emerald-400">
              GPA: 8.00
            </span>
          </div>
          <div className="w-full h-1 bg-brand-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500"
              style={{ width: "80%" }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-cream">Anh Văn</span>
            <span className="text-xs font-bold text-sky-400">
              GPA: 8.80
            </span>
          </div>
          <div className="w-full h-1 bg-brand-dark rounded-full overflow-hidden">
            <div className="h-full bg-sky-400" style={{ width: "88%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
