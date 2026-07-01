import Link from "next/link";
import { ChevronLeft, ChevronRight, UserRoundSearch } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";

import type { AdminCourseStudent } from "../types";
import {
  COURSE_PROGRESS_LABELS,
  COURSE_PROGRESS_STYLES,
  ENROLLMENT_SOURCE_LABELS,
  formatAdminDate,
} from "../utils/course-student-presenter";
import CourseStudentAvatar from "./course-student-avatar";

type CourseStudentsTableProps = {
  courseId: string;
  students: AdminCourseStudent[];
  page: number;
  totalPages: number;
  totalItems: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
};

export default function CourseStudentsTable({
  courseId,
  students,
  page,
  totalPages,
  totalItems,
  isFetching,
  onPageChange,
}: CourseStudentsTableProps) {
  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-admin-border/30 bg-admin-surface-low py-12">
        <EmptyState
          icon={UserRoundSearch}
          title="Chưa có học viên phù hợp"
          description="Khóa học chưa có học viên hoặc không có kết quả khớp với bộ lọc hiện tại."
          className="border-0 bg-transparent"
        />
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-admin-border/30 bg-admin-surface-low transition-opacity ${
        isFetching ? "opacity-70" : "opacity-100"
      }`}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead className="border-b border-admin-border/30 bg-admin-deep/60 text-xs text-admin-muted">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Học viên</th>
              <th className="px-4 py-3.5 font-semibold">Ngày tham gia</th>
              <th className="px-4 py-3.5 font-semibold">Tiến độ</th>
              <th className="px-4 py-3.5 font-semibold">Bài học</th>
              <th className="px-4 py-3.5 font-semibold">Bài kiểm tra</th>
              <th className="px-4 py-3.5 font-semibold">Cần chú ý</th>
              <th className="px-4 py-3.5 font-semibold">Hoạt động gần nhất</th>
              <th className="px-4 py-3.5 font-semibold">Trạng thái</th>
              <th className="px-5 py-3.5 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border/20">
            {students.map((item) => (
              <tr
                key={item.student.id}
                className="transition-colors hover:bg-admin-deep/35"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <CourseStudentAvatar
                      fullName={item.student.fullName}
                      avatarUrl={item.student.avatarUrl}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-admin-cream">
                        {item.student.fullName}
                      </p>
                      <p className="truncate text-xs text-admin-muted">
                        {item.student.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-xs text-admin-muted">
                  <p>{formatAdminDate(item.enrolledAt)}</p>
                  <p className="mt-1">
                    {ENROLLMENT_SOURCE_LABELS[item.source]}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex w-36 items-center gap-2">
                    <div
                      className="h-1.5 flex-1 overflow-hidden rounded-full bg-admin-deep"
                      role="progressbar"
                      aria-label={`Tiến độ của ${item.student.fullName}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={item.progressPercentage}
                    >
                      <div
                        className="h-full rounded-full bg-admin-pink"
                        style={{ width: `${item.progressPercentage}%` }}
                      />
                    </div>
                    <span className="w-9 text-right text-xs font-semibold text-admin-cream">
                      {item.progressPercentage}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 font-semibold text-admin-cream">
                  {item.completedLessons}/{item.totalLessons}
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-admin-cream">
                    {item.assessmentProgress.completedAssessments}/
                    {item.assessmentProgress.totalAssessments} hoàn thành
                  </p>
                  <p className="mt-1 text-xs text-admin-muted">
                    Điểm cao nhất: {item.assessmentProgress.bestScore ?? "—"}
                  </p>
                </td>
                <td className="px-4 py-4 text-xs">
                  {item.assessmentProgress.notStartedAssessments > 0 && (
                    <p className="text-amber-300">
                      {item.assessmentProgress.notStartedAssessments} chưa nộp
                    </p>
                  )}
                  {item.assessmentProgress.pendingGradingAssessments > 0 && (
                    <p className="mt-1 text-admin-pink">
                      {item.assessmentProgress.pendingGradingAssessments} chờ
                      chấm
                    </p>
                  )}
                  {item.assessmentProgress.notStartedAssessments === 0 &&
                    item.assessmentProgress.pendingGradingAssessments === 0 && (
                      <span className="text-admin-muted">Không có</span>
                    )}
                </td>
                <td className="px-4 py-4 text-xs text-admin-muted">
                  {formatAdminDate(item.latestActivityAt)}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${COURSE_PROGRESS_STYLES[item.progressStatus]}`}
                  >
                    {COURSE_PROGRESS_LABELS[item.progressStatus]}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/courses/${courseId}/students/${item.student.id}`}
                    className="inline-flex items-center rounded-md border border-admin-border/30 px-3 py-2 text-xs font-semibold text-admin-cream transition-colors hover:border-admin-pink/50 hover:text-admin-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-pink/50"
                  >
                    Xem tiến độ
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-admin-border/30 px-5 py-3 text-xs text-admin-muted sm:flex-row sm:items-center sm:justify-between">
        <span>{totalItems} học viên</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Trang trước"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-admin-border/30 transition-colors hover:border-admin-pink/50 hover:text-admin-pink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="min-w-20 text-center">
            Trang {page}/{Math.max(totalPages, 1)}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Trang sau"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-admin-border/30 transition-colors hover:border-admin-pink/50 hover:text-admin-pink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
