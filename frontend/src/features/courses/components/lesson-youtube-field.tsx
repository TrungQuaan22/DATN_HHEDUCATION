"use client";

import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { LessonFormValues } from "../validation";

interface LessonYoutubeFieldProps {
  register: UseFormRegister<LessonFormValues>;
  errors: FieldErrors<LessonFormValues>;
}

export default function LessonYoutubeField({
  register,
  errors,
}: LessonYoutubeFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor="youtube-url-input"
        className="text-xs font-bold text-admin-muted block uppercase tracking-widest"
      >
        Đường dẫn YouTube URL <span className="text-admin-pink">*</span>
      </label>
      <input
        id="youtube-url-input"
        type="url"
        {...register("youtubeUrl")}
        placeholder="https://www.youtube.com/watch?v=..."
        className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded px-4 py-3 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-sm"
      />
      {errors.youtubeUrl && (
        <p className="text-red-400 text-xs mt-1">
          {errors.youtubeUrl.message}
        </p>
      )}
    </div>
  );
}
