import { Search } from "lucide-react";

import type { CourseStudentProgressStatus } from "../types";

type CourseStudentFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  progressStatus: CourseStudentProgressStatus | "";
  onProgressStatusChange: (value: CourseStudentProgressStatus | "") => void;
};

export default function CourseStudentFilters({
  search,
  onSearchChange,
  progressStatus,
  onProgressStatusChange,
}: CourseStudentFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-admin-border/30 bg-admin-surface-low p-3 sm:flex-row sm:items-center">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Tìm học viên</span>
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          className="h-10 w-full rounded-md border border-admin-border/30 bg-admin-deep pl-9 pr-3 text-sm text-admin-cream outline-none placeholder:text-admin-muted focus:border-admin-pink"
        />
      </label>

      <label className="sm:w-48">
        <span className="sr-only">Lọc theo tiến độ</span>
        <select
          value={progressStatus}
          onChange={(event) =>
            onProgressStatusChange(
              event.target.value as CourseStudentProgressStatus | "",
            )
          }
          className="h-10 w-full rounded-md border border-admin-border/30 bg-admin-deep px-3 text-sm text-admin-cream outline-none focus:border-admin-pink"
        >
          <option value="">Tất cả tiến độ</option>
          <option value="not_started">Chưa bắt đầu</option>
          <option value="in_progress">Đang học</option>
          <option value="completed">Hoàn thành</option>
        </select>
      </label>
    </div>
  );
}
