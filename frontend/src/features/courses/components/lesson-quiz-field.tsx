"use client";

import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { LessonFormValues } from "../validation";
import { RefreshCw } from "lucide-react";

interface LessonQuizFieldProps {
  register: UseFormRegister<LessonFormValues>;
  errors: FieldErrors<LessonFormValues>;
  assessments: { id: string; title: string }[];
  courseId?: string;
  lessonId?: string;
  onRefresh?: () => void;
}

export default function LessonQuizField({
  register,
  errors,
  assessments,
  courseId,
  lessonId,
  onRefresh,
}: LessonQuizFieldProps) {
  return (
    <div className="space-y-3 pt-2 border-t border-admin-border/10">
      <label
        htmlFor="assessment-select"
        className="text-xs font-bold text-admin-muted block uppercase tracking-widest"
      >
        Chọn bài kiểm tra bài học <span className="text-admin-pink">*</span>
      </label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <select
            id="assessment-select"
            {...register("assessmentId")}
            className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded px-4 py-3 text-admin-cream transition-all font-medium text-[14px] appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
              backgroundSize: "1rem",
            }}
          >
            <option value="" className="bg-admin-deep text-admin-cream">
              -- Chọn bài kiểm tra liên kết --
            </option>
            {assessments.map((a) => (
              <option
                key={a.id}
                value={a.id}
                className="bg-admin-deep text-admin-cream"
              >
                {a.title}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center justify-center p-3 rounded-lg border border-admin-border/30 bg-admin-surface-low text-admin-cream hover:border-admin-pink transition active:scale-95"
          title="Tải lại danh sách đề thi"
        >
          <RefreshCw size={16} />
        </button>
        <button
          type="button"
          onClick={() => {
            const url = `/admin/assessments/builder?placementType=lesson&courseId=${courseId || ""}${lessonId ? `&lessonId=${lessonId}` : ""}`;
            window.open(url, "_blank");
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg bg-admin-pink text-white font-bold text-xs hover:brightness-110 transition active:scale-95 whitespace-nowrap"
        >
          + Tạo mới
        </button>
      </div>
      {errors.assessmentId && (
        <p className="text-red-400 text-xs mt-1">
          {errors.assessmentId.message}
        </p>
      )}
    </div>
  );
}
