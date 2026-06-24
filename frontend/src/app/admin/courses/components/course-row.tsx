"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle, Archive, Edit } from "lucide-react";
import { SUBJECT_LABELS } from "@/types/common";
import { AdminCourseSummary } from "@/features/courses/types";
import { SafeImage } from "@/components/media/safe-image";

interface CourseRowProps {
  course: AdminCourseSummary;
  isActionPending: boolean;
  onPublish: (courseId: string) => Promise<void>;
  onArchive: (courseId: string) => Promise<void>;
  onEdit?: (course: AdminCourseSummary) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export default function CourseRow({
  course,
  isActionPending,
  onPublish,
  onArchive,
  onEdit,
}: CourseRowProps) {
  const hasDiscount = course.salePrice !== null;

  return (
    <tr className="group hover:bg-admin-surface-low/20 transition-colors text-sm">
      {/* Thumbnail & Title */}
      <td className="pl-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-lg border border-admin-border/20 flex-shrink-0 overflow-hidden bg-admin-surface-low">
            <SafeImage
              alt={course.title}
              fill
              sizes="48px"
              className="object-cover"
              src={course.thumbnailUrl}
            />
          </div>
          <div className="min-w-0 z-10">
            <p
              className="font-bold text-admin-cream leading-tight flex items-center gap-1.5"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
              }}
            >
              {course.title}
              {course.isFeatured && (
                <span className="inline-block bg-amber-500/10 text-amber-500 text-xs font-bold px-1.5 py-0.5 rounded border border-amber-500/20 flex-shrink-0">
                  HOT
                </span>
              )}
            </p>
          </div>
        </div>
      </td>

      {/* Teacher */}
      <td className="py-4 font-semibold text-admin-cream">
        <div>
          <p>{course.teacher.fullName}</p>
          <p className="text-xs text-admin-muted font-normal leading-none mt-0.5">
            {course.teacher.email}
          </p>
        </div>
      </td>

      {/* Subject */}
      <td className="py-4 text-admin-muted">
        {SUBJECT_LABELS[course.subject] || course.subject}
      </td>

      {/* Grade */}
      <td className="py-4 text-admin-muted font-semibold">
        Lớp {course.grade}
      </td>

      {/* Status */}
      <td className="py-4">
        {course.status === "published" && (
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
            PUBLISHED
          </span>
        )}
        {course.status === "draft" && (
          <span className="px-2 py-0.5 rounded bg-admin-pink/10 text-admin-pink text-xs font-bold uppercase tracking-wider border border-admin-pink/20">
            DRAFT
          </span>
        )}
        {course.status === "archived" && (
          <span className="px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-400 text-xs font-bold uppercase tracking-wider border border-zinc-500/20">
            ARCHIVED
          </span>
        )}
      </td>

      {/* Price */}
      <td className="py-4 font-semibold">
        {hasDiscount ? (
          <div>
            <p className="text-admin-cream">{formatPrice(course.salePrice!)}</p>
            <p className="text-xs text-admin-muted line-through leading-none mt-0.5 font-normal">
              {formatPrice(course.price)}
            </p>
          </div>
        ) : (
          <span className="text-admin-cream">{formatPrice(course.price)}</span>
        )}
      </td>

      {/* Total Lessons */}
      <td className="py-4 font-semibold text-admin-cream text-center">
        {course.totalLessons ?? 0} bài
      </td>

      {/* Enrolled Count */}
      <td className="py-4 font-semibold text-admin-cream text-center">
        {course.enrolledCount ?? 0}
      </td>

      {/* Updated date */}
      <td className="py-4 text-admin-muted text-xs">
        {formatDate(course.updatedAt)}
      </td>

      {/* Actions */}
      <td className="pr-6 py-4 text-right sticky right-0 bg-admin-deep group-hover:bg-admin-surface-low/20 transition-colors z-10 border-l border-admin-border/10">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/courses/${course.id}/builder`}
            className={`bg-admin-surface-low hover:border-admin-pink border border-admin-border/30 text-admin-cream px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer min-w-fit ${
              isActionPending ? "pointer-events-none opacity-40" : ""
            }`}
          >
            Content
          </Link>

          {/* Publish/Archive quickly */}
          {course.status === "draft" ? (
            <button
              onClick={() => onPublish(course.id)}
              disabled={isActionPending}
              className="p-1.5 text-admin-muted hover:text-emerald-400 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              title="Phát hành khóa học"
            >
              <CheckCircle size={16} />
            </button>
          ) : course.status === "published" ? (
            <button
              onClick={() => onArchive(course.id)}
              disabled={isActionPending}
              className="p-1.5 text-admin-muted hover:text-amber-500 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              title="Lưu trữ khóa học"
            >
              <Archive size={16} />
            </button>
          ) : (
            <div className="w-7 h-7 shrink-0" />
          )}

          <button
            onClick={() => onEdit?.(course)}
            disabled={isActionPending}
            className="p-1.5 text-admin-muted hover:text-admin-cream rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            title="Chỉnh sửa thông tin"
          >
            <Edit size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
