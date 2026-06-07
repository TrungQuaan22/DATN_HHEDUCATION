"use client";

import React from "react";
import VideoUploadField from "@/components/media/video-upload-field";

interface LessonSystemVideoFieldProps {
  value: string | null | undefined;
  onChange: (val: string | null) => void;
  initialFileName: string | null;
  error?: string;
}

export default function LessonSystemVideoField({
  value,
  onChange,
  initialFileName,
  error,
}: LessonSystemVideoFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-admin-muted block uppercase tracking-widest">
        Tải lên file video
      </label>
      <VideoUploadField
        value={value || null}
        onChange={onChange}
        initialFileName={initialFileName}
        error={error}
      />
    </div>
  );
}
