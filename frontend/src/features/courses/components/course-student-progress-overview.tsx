import { BookOpenCheck, CalendarDays, Clock3, ListChecks } from "lucide-react";

import type { AdminCourseStudentProgress } from "../types";
import {
  COURSE_PROGRESS_LABELS,
  COURSE_PROGRESS_STYLES,
  ENROLLMENT_SOURCE_LABELS,
  formatAdminDate,
} from "../utils/course-student-presenter";
import CourseStudentAvatar from "./course-student-avatar";

type CourseStudentProgressOverviewProps = {
  data: AdminCourseStudentProgress;
};

export default function CourseStudentProgressOverview({
  data,
}: CourseStudentProgressOverviewProps) {
  const remainingLessons = Math.max(
    0,
    data.course.totalLessons - data.summary.completedLessons,
  );

  return (
    <section className="overflow-hidden rounded-xl border border-admin-border/30 bg-admin-surface-low">
      <div className="flex flex-col gap-5 border-b border-admin-border/25 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <CourseStudentAvatar
            fullName={data.student.fullName}
            avatarUrl={data.student.avatarUrl}
            size="md"
          />
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-admin-cream">
              {data.student.fullName}
            </h2>
            <p className="truncate text-sm text-admin-muted">
              {data.student.email}
            </p>
          </div>
        </div>
        <span
          className={`self-start rounded-md border px-2.5 py-1 text-xs font-semibold sm:self-auto ${COURSE_PROGRESS_STYLES[data.summary.progressStatus]}`}
        >
          {COURSE_PROGRESS_LABELS[data.summary.progressStatus]}
        </span>
      </div>

      <div className="grid gap-px bg-admin-border/20 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewItem
          icon={BookOpenCheck}
          label="Tiến độ tổng thể"
          value={`${data.summary.progressPercentage}%`}
          detail={`${data.summary.completedLessons}/${data.course.totalLessons} bài hoàn thành`}
        />
        <OverviewItem
          icon={ListChecks}
          label="Bài còn lại"
          value={String(remainingLessons)}
          detail={
            remainingLessons === 0
              ? "Đã hoàn thành curriculum"
              : "Cần tiếp tục học"
          }
        />
        <OverviewItem
          icon={Clock3}
          label="Hoạt động gần nhất"
          value={data.summary.lastLearnedAt ? "Đã học" : "Chưa học"}
          detail={formatAdminDate(data.summary.lastLearnedAt)}
        />
        <OverviewItem
          icon={CalendarDays}
          label="Ngày tham gia"
          value={ENROLLMENT_SOURCE_LABELS[data.enrollment.source]}
          detail={formatAdminDate(data.enrollment.enrolledAt)}
        />
      </div>

      <div className="px-5 py-4 md:px-6">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-admin-cream">
            Mức độ hoàn thành
          </span>
          <span className="text-admin-muted">
            {data.summary.progressPercentage}%
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-admin-deep"
          role="progressbar"
          aria-label={`Tiến độ khóa học của ${data.student.fullName}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={data.summary.progressPercentage}
        >
          <div
            className="h-full rounded-full bg-admin-pink"
            style={{ width: `${data.summary.progressPercentage}%` }}
          />
        </div>
      </div>
    </section>
  );
}

type OverviewItemProps = {
  icon: typeof BookOpenCheck;
  label: string;
  value: string;
  detail: string;
};

function OverviewItem({ icon: Icon, label, value, detail }: OverviewItemProps) {
  return (
    <div className="flex gap-3 bg-admin-surface-low px-5 py-4 md:px-6">
      <Icon
        size={17}
        className="mt-0.5 shrink-0 text-admin-pink"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-xs text-admin-muted">{label}</p>
        <p className="mt-0.5 font-bold text-admin-cream">{value}</p>
        <p className="mt-1 truncate text-xs text-admin-muted">{detail}</p>
      </div>
    </div>
  );
}
