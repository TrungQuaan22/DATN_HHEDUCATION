"use client";

import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { LessonFormValues } from "../validation";

interface LessonQuizFieldProps {
  register: UseFormRegister<LessonFormValues>;
  errors: FieldErrors<LessonFormValues>;
  assessments: { id: string; title: string }[];
}

export default function LessonQuizField({
  register,
  errors,
  assessments,
}: LessonQuizFieldProps) {
  return (
    <div className="space-y-3 pt-2 border-t border-admin-border/10">
      <label
        htmlFor="assessment-select"
        className="text-xs font-bold text-admin-muted block uppercase tracking-widest"
      >
        Chọn bài kiểm tra bài học <span className="text-admin-pink">*</span>
      </label>
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
      {errors.assessmentId && (
        <p className="text-red-400 text-xs mt-1">
          {errors.assessmentId.message}
        </p>
      )}
    </div>
  );
}
