"use client";

import React from "react";
import Link from "next/link";
import { Award, ChevronLeft, Menu } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserDropdown } from "@/components/layout/user-dropdown";

interface StudentLearningHeaderProps {
  course: {
    completedLessons: number;
    totalLessons: number;
  };
  courseProgressPercentage: number;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (value: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

export function StudentLearningHeader({
  course,
  courseProgressPercentage,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: StudentLearningHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[56px] items-center justify-between border-b border-border-dark/60 bg-deep-black px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/student"
          className="hidden shrink-0 text-[16px] font-bold tracking-tight text-cream hover:opacity-90 sm:inline-flex"
        >
          HH <span className="font-extrabold text-brand-pink">Education</span>
        </Link>

        <Link
          href="/student/courses"
          className="shrink-0 rounded-lg border border-border-dark bg-surface-input p-1.5 text-cream transition-all hover:text-brand-pink"
          title="Quay lại"
        >
          <ChevronLeft size={16} />
        </Link>

        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden shrink-0 cursor-pointer rounded-lg border border-border-dark bg-surface-input p-1.5 text-cream transition-all hover:text-brand-pink active:scale-95 md:flex"
          title={isSidebarCollapsed ? "Mở rộng danh mục" : "Thu gọn danh mục"}
        >
          <Menu size={16} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border-dark bg-off-black px-3 py-1 text-[11px] font-semibold text-muted-text lg:inline-flex">
          <Award size={13} className="animate-pulse text-brand-pink" />
          Đã hoàn thành: {course.completedLessons}/{course.totalLessons} bài học (
          {courseProgressPercentage}%)
        </span>

        <ThemeToggle className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border-dark bg-surface-input text-cream transition-all hover:border-brand-pink hover:text-brand-pink active:scale-95" />

        <NotificationBell className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border-dark bg-surface-input text-cream transition-all hover:border-brand-pink hover:text-brand-pink active:scale-95" />

        <UserDropdown sizeClassName="w-9 h-9" />

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="shrink-0 rounded-lg border border-border-dark bg-surface-input p-1.5 text-cream transition-all hover:text-brand-pink active:scale-95 md:hidden"
          aria-label="Toggle Curriculum"
        >
          <Menu size={16} />
        </button>
      </div>
    </header>
  );
}
