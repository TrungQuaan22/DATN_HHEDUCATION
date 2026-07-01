"use client";

import React from "react";
import { Archive, CheckCircle, RefreshCw, Settings } from "lucide-react";

interface CurriculumBuilderHeaderProps {
  courseStatus: "draft" | "published" | "archived" | undefined;
  onPublish: () => void;
  onArchive: () => void;
  isPublishPending: boolean;
  isArchivePending: boolean;
  onEditSettings: () => void;
}

export default function CurriculumBuilderHeader({
  courseStatus,
  onPublish,
  onArchive,
  isPublishPending,
  isArchivePending,
  onEditSettings,
}: CurriculumBuilderHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-admin-border/30 bg-admin-surface-low p-5 text-admin-cream md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-lg font-bold text-admin-cream">
          Cấu trúc nội dung
        </h2>
        <p className="mt-1 text-sm text-admin-muted">
          Sắp xếp chương, bài học và học liệu trong curriculum của khóa học.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {courseStatus === "draft" ? (
          <button
            type="button"
            onClick={onPublish}
            disabled={isPublishPending}
            className="flex items-center gap-1.5 rounded-md bg-admin-pink px-4 py-2 text-sm font-bold text-admin-deep transition hover:brightness-105 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle size={15} aria-hidden="true" />
            Xuất bản khóa học
          </button>
        ) : courseStatus === "published" ? (
          <button
            type="button"
            onClick={onArchive}
            disabled={isArchivePending}
            className="flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-400 transition-colors hover:bg-amber-500/15 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Archive size={15} aria-hidden="true" />
            Lưu trữ khóa học
          </button>
        ) : (
          <button
            type="button"
            onClick={onPublish}
            disabled={isPublishPending}
            className="flex items-center gap-1.5 rounded-md bg-admin-pink px-4 py-2 text-sm font-bold text-admin-deep transition hover:brightness-105 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Mở lại bản nháp
          </button>
        )}

        <button
          type="button"
          onClick={onEditSettings}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-admin-border/30 bg-admin-deep text-admin-cream transition-colors hover:border-admin-pink/50 hover:text-admin-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-pink/50"
          title="Chỉnh sửa thông tin cơ bản"
          aria-label="Chỉnh sửa thông tin cơ bản"
        >
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
}
