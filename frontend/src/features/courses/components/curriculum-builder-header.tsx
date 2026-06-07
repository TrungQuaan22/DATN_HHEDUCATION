"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  Archive,
  RefreshCw,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CurriculumBuilderHeaderProps {
  courseTitle: string | null;
  courseStatus: "draft" | "published" | "archived" | undefined;
  onPublish: () => void;
  onArchive: () => void;
  isPublishPending: boolean;
  isArchivePending: boolean;
  onEditSettings: () => void;
}

export default function CurriculumBuilderHeader({
  courseTitle,
  courseStatus,
  onPublish,
  onArchive,
  isPublishPending,
  isArchivePending,
  onEditSettings,
}: CurriculumBuilderHeaderProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-admin-muted">
        <Link
          href="/admin/courses"
          className="hover:text-admin-pink transition-colors"
        >
          Quản lý khóa học
        </Link>
        <ChevronRight size={12} />
        <span className="truncate max-w-[200px]">
          {courseTitle || "Đang tải..."}
        </span>
        <ChevronRight size={12} />
        <span className="text-admin-cream font-bold">
          Trình xây dựng chương trình học
        </span>
      </div>

      {/* Main Top Header */}
      <div className="bg-admin-surface-low border border-admin-border/30 rounded p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg text-admin-cream">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/courses")}
            className="text-admin-muted hover:text-admin-pink p-2 bg-admin-deep hover:bg-admin-deep/70 border border-admin-border/10 rounded-full transition-all cursor-pointer"
            type="button"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold font-serif leading-tight">
                {courseTitle || "Đang tải khóa học..."}
              </h1>
              {courseStatus && (
                <>
                  {courseStatus === "draft" && (
                    <span className="px-2 py-0.5 rounded bg-admin-pink/10 text-admin-pink text-[10px] font-bold uppercase tracking-wider border border-admin-pink/20">
                      DRAFT
                    </span>
                  )}
                  {courseStatus === "published" && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                      PUBLISHED
                    </span>
                  )}
                  {courseStatus === "archived" && (
                    <span className="px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-400 text-[10px] font-bold uppercase tracking-wider border border-zinc-500/20">
                      ARCHIVED
                    </span>
                  )}
                </>
              )}
            </div>
            <p className="text-xs text-admin-muted mt-1">
              Sẵn sàng chỉnh sửa nội dung khóa học
            </p>
          </div>
        </div>

        {/* Quick action buttons on Course */}
        <div className="flex items-center gap-2.5">
          {courseStatus === "draft" ? (
            <button
              onClick={onPublish}
              disabled={isPublishPending}
              className="bg-admin-pink text-white px-5 py-2 text-[13px] font-bold rounded flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle size={15} />
              Xuất bản khóa học
            </button>
          ) : courseStatus === "published" ? (
            <button
              onClick={onArchive}
              disabled={isArchivePending}
              className="border border-amber-500/30 bg-amber-500/10 text-amber-400 px-5 py-2 text-[13px] font-bold rounded flex items-center gap-1.5 hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Archive size={15} />
              Lưu trữ khóa học
            </button>
          ) : (
            <button
              onClick={onPublish}
              disabled={isPublishPending}
              className="bg-admin-pink text-white px-5 py-2 text-[13px] font-bold rounded flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={15} />
              Mở lại bản nháp
            </button>
          )}

          <button
            onClick={onEditSettings}
            className="p-2 border border-admin-border/30 bg-admin-deep text-admin-cream rounded hover:border-admin-pink transition-all"
            title="Chỉnh sửa thông tin cơ bản"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

