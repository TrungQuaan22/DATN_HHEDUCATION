import type { AdminCourseStudent, CourseStudentProgressStatus } from "../types";

export const COURSE_PROGRESS_LABELS: Record<
  CourseStudentProgressStatus,
  string
> = {
  not_started: "Chưa bắt đầu",
  in_progress: "Đang học",
  completed: "Hoàn thành",
};

export const COURSE_PROGRESS_STYLES: Record<
  CourseStudentProgressStatus,
  string
> = {
  not_started: "border-admin-border/30 bg-admin-surface-low text-admin-muted",
  in_progress: "border-amber-500/25 bg-amber-500/10 text-amber-400",
  completed: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
};

export const ENROLLMENT_SOURCE_LABELS: Record<
  AdminCourseStudent["source"],
  string
> = {
  payment: "Thanh toán",
  manual: "Cấp thủ công",
  free: "Miễn phí",
};

export function formatAdminDate(value: string | null): string {
  if (!value) return "Chưa có hoạt động";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/);
  return words
    .slice(-2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}
