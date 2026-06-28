"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BookOpen, ChevronRight, Users } from "lucide-react";

import type { AdminCourseDetail } from "../types";

type CourseManagementHeaderProps = {
  courseId: string;
  course?: AdminCourseDetail;
  isLoading: boolean;
};

const STATUS_LABELS = {
  draft: "Bản nháp",
  published: "Đã xuất bản",
  archived: "Đã lưu trữ",
};

export default function CourseManagementHeader({
  courseId,
  course,
  isLoading,
}: CourseManagementHeaderProps) {
  const pathname = usePathname();
  const tabs = [
    {
      label: "Quản lý học viên",
      href: `/admin/courses/${courseId}/students`,
      icon: Users,
      active: pathname.includes(`/courses/${courseId}/students`),
    },
    {
      label: "Quản lý nội dung",
      href: `/admin/courses/${courseId}/builder`,
      icon: BookOpen,
      active: pathname.includes(`/courses/${courseId}/builder`),
    },
  ];

  return (
    <header className="space-y-5">
      <nav
        aria-label="Đường dẫn quản lý khóa học"
        className="flex min-w-0 items-center gap-2 text-xs text-admin-muted"
      >
        <Link
          href="/admin/courses"
          className="transition-colors hover:text-admin-pink focus-visible:outline-none focus-visible:text-admin-pink"
        >
          Quản lý khóa học
        </Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span className="truncate text-admin-cream">
          {course?.title || "Đang tải khóa học..."}
        </span>
      </nav>

      <div className="rounded-xl border border-admin-border/30 bg-admin-surface-low p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Link
              href="/admin/courses"
              aria-label="Quay lại danh sách khóa học"
              className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-admin-border/30 text-admin-muted transition-colors hover:border-admin-pink/50 hover:text-admin-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-pink/50"
            >
              <ArrowLeft size={17} />
            </Link>
            <div className="min-w-0">
              {isLoading ? (
                <div
                  className="space-y-2"
                  aria-label="Đang tải thông tin khóa học"
                >
                  <div className="h-7 w-64 animate-pulse rounded bg-admin-border/30" />
                  <div className="h-4 w-48 animate-pulse rounded bg-admin-border/20" />
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="truncate text-xl font-bold text-admin-cream md:text-2xl">
                      {course?.title}
                    </h1>
                    {course && (
                      <span className="rounded-md border border-admin-pink/25 bg-admin-pink/10 px-2 py-0.5 text-xs font-semibold text-admin-pink">
                        {STATUS_LABELS[course.status]}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-admin-muted">
                    {course
                      ? `${course.teacher.fullName} · ${course.enrolledCount} học viên · ${course.totalLessons} bài học`
                      : "Không tìm thấy thông tin khóa học"}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <nav
          aria-label="Các khu vực quản lý khóa học"
          className="mt-6 flex gap-1 overflow-x-auto border-b border-admin-border/30"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-admin-pink/50 ${
                  tab.active
                    ? "border-admin-pink text-admin-pink"
                    : "border-transparent text-admin-muted hover:text-admin-cream"
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
