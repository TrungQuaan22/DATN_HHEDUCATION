"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Subject, Grade, SUBJECT_LABELS } from "@/types/common";
import { CourseStatus } from "@/features/courses/types";

type CoursesFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  status: CourseStatus | "all";
  onStatusChange: (value: CourseStatus | "all") => void;
  subject: Subject | "all";
  onSubjectChange: (value: Subject | "all") => void;
  grade: Grade | "all";
  onGradeChange: (value: Grade | "all") => void;
  isFeaturedOnly: boolean;
  onFeaturedOnlyChange: (value: boolean) => void;
};

export default function CoursesFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  subject,
  onSubjectChange,
  grade,
  onGradeChange,
  isFeaturedOnly,
  onFeaturedOnlyChange,
}: CoursesFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search state changes by 500ms
  useEffect(() => {
    if (localSearch === search) return;

    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch, search, onSearchChange]);

  // Sync localSearch if search is reset externally (e.g. if the search is cleared)
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  return (
    <div className="bg-admin-surface-low p-6 rounded border border-admin-border/30 flex flex-wrap items-center gap-4 shadow-sm text-admin-cream">
      {/* Search input */}
      <div className="flex-grow min-w-[200px]">
        <label className="block text-xs font-bold uppercase text-admin-muted mb-2 tracking-wider">
          Tìm kiếm
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted w-4 h-4" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Tên khóa học, slug..."
            className="w-full bg-admin-deep border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded-full pl-9 pr-4 py-2 text-sm text-admin-cream placeholder:text-admin-muted/40"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="w-40">
        <label className="block text-xs font-bold uppercase text-admin-muted mb-2 tracking-wider">
          Trạng thái
        </label>
        <select
          value={status}
          onChange={(e) =>
            onStatusChange(e.target.value as CourseStatus | "all")
          }
          className="w-full bg-admin-deep border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-0 py-2 px-3 rounded-2xl text-sm text-admin-cream appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.75rem center",
            backgroundSize: "0.85rem",
          }}
        >
          <option value="all">Tất cả</option>
          <option value="draft">Bản nháp (Draft)</option>
          <option value="published">Đã phát hành (Published)</option>
          <option value="archived">Đã lưu trữ (Archived)</option>
        </select>
      </div>

      {/* Subject Filter */}
      <div className="w-40">
        <label className="block text-xs font-bold uppercase text-admin-muted mb-2 tracking-wider">
          Môn học
        </label>
        <select
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value as Subject | "all")}
          className="w-full bg-admin-deep border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-0 py-2 px-3 rounded-2xl text-sm text-admin-cream appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.75rem center",
            backgroundSize: "0.85rem",
          }}
        >
          <option value="all">Tất cả môn</option>
          {Object.entries(SUBJECT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Grade Filter */}
      <div className="w-32">
        <label className="block text-xs font-bold uppercase text-admin-muted mb-2 tracking-wider">
          Khối lớp
        </label>
        <select
          value={grade}
          onChange={(e) =>
            onGradeChange(
              e.target.value === "all"
                ? "all"
                : (Number(e.target.value) as Grade),
            )
          }
          className="w-full bg-admin-deep border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-0 py-2 px-3 rounded-2xl text-sm text-admin-cream appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.75rem center",
            backgroundSize: "0.85rem",
          }}
        >
          <option value="all">Tất cả khối</option>
          {[9, 10, 11, 12].map((g) => (
            <option key={g} value={g}>
              Lớp {g}
            </option>
          ))}
        </select>
      </div>

      {/* Featured Filter */}
      <div className="flex items-center gap-2 pt-6">
        <input
          id="featured-filter"
          type="checkbox"
          checked={isFeaturedOnly}
          onChange={(e) => onFeaturedOnlyChange(e.target.checked)}
          className="w-4 h-4 bg-admin-deep border-admin-border/30 rounded-2xl text-admin-pink focus:ring-admin-pink focus:ring-offset-0 cursor-pointer"
        />
        <label
          htmlFor="featured-filter"
          className="text-sm font-bold text-admin-cream cursor-pointer select-none"
        >
          Nổi bật
        </label>
      </div>
    </div>
  );
}

