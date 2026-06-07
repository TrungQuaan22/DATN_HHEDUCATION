"use client";

import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminCourseSummary } from "@/features/courses/types";
import CourseRow from "./course-row";

const ITEMS_PER_PAGE = 5;

function TableSkeleton() {
  return (
    <div className="divide-y divide-admin-border/10 animate-pulse">
      {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="w-12 h-12 rounded-lg bg-admin-surface-low/50 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-admin-surface-low/50 rounded w-1/3" />
            <div className="h-3 bg-admin-surface-low/50 rounded w-1/4" />
          </div>
          <div className="h-4 bg-admin-surface-low/50 rounded w-20 hidden md:block" />
          <div className="h-4 bg-admin-surface-low/50 rounded w-16" />
          <div className="h-4 bg-admin-surface-low/50 rounded w-24" />
          <div className="h-6 bg-admin-surface-low/50 rounded w-16" />
          <div className="h-8 bg-admin-surface-low/50 rounded w-28" />
        </div>
      ))}
    </div>
  );
}

type CoursesTableProps = {
  coursesList: AdminCourseSummary[];
  isLoading: boolean;
  isFetching: boolean;
  isActionPending?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPublish: (courseId: string) => Promise<void>;
  onArchive: (courseId: string) => Promise<void>;
  onEdit?: (course: AdminCourseSummary) => void;
};

export default function CoursesTable({
  coursesList,
  isLoading,
  isFetching,
  isActionPending = false,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onPublish,
  onArchive,
  onEdit,
}: CoursesTableProps) {
  const emptyRowsCount = ITEMS_PER_PAGE - coursesList.length;

  return (
    <div className="bg-admin-deep border border-admin-border/30 rounded shadow-sm overflow-hidden text-admin-cream">
      {isLoading ? (
        <TableSkeleton />
      ) : coursesList.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <SlidersHorizontal size={40} className="text-admin-muted mb-4" />
          <h3 className="text-lg font-bold text-admin-cream">
            Chưa có khóa học nào
          </h3>
          <p className="text-admin-muted text-sm mt-1 max-w-sm">
            Không có khóa học nào khớp với bộ lọc tìm kiếm hoặc hệ thống chưa có
            dữ liệu.
          </p>
        </div>
      ) : (
        <div
          className={`overflow-x-auto custom-scrollbar transition-opacity duration-200 ${
            isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          <table className="w-full border-collapse text-left min-w-[1300px]">
            <thead className="bg-admin-surface-low/50 border-b border-admin-border/30">
              <tr className="text-admin-muted text-[12px] font-bold uppercase tracking-wider">
                <th className="pl-6 py-4 w-[320px] min-w-[280px]">Khóa học</th>
                <th className="py-4 w-[180px] min-w-[140px]">Giảng viên</th>
                <th className="py-4 w-[110px] min-w-[90px]">Môn học</th>
                <th className="py-4 w-[90px] min-w-[70px]">Khối lớp</th>
                <th className="py-4 w-[120px] min-w-[105px]">Trạng thái</th>
                <th className="py-4 w-[130px] min-w-[110px]">Giá cả</th>
                <th className="py-4 w-[120px] min-w-[100px] text-center">
                  Số bài học
                </th>
                <th className="py-4 w-[120px] min-w-[100px] text-center">
                  Học viên
                </th>
                <th className="py-4 w-[120px] min-w-[100px]">Cập nhật</th>
                <th className="pr-6 py-4 text-right sticky right-0 bg-admin-surface-low border-l border-admin-border/10 z-20 w-[200px] min-w-[180px]">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border/10">
              {coursesList.map((course) => (
                <CourseRow
                  key={course.id}
                  course={course}
                  isActionPending={isActionPending}
                  onPublish={onPublish}
                  onArchive={onArchive}
                  onEdit={onEdit}
                />
              ))}
              {emptyRowsCount > 0 &&
                Array.from({ length: emptyRowsCount }).map((_, idx) => (
                  <tr
                    key={`empty-${idx}`}
                    className="border-b border-transparent text-[14px]"
                  >
                    <td className="pl-6 py-4">
                      <div className="h-12" />
                    </td>
                    <td className="py-4">&nbsp;</td>
                    <td className="py-4">&nbsp;</td>
                    <td className="py-4">&nbsp;</td>
                    <td className="py-4">&nbsp;</td>
                    <td className="py-4">&nbsp;</td>
                    <td className="py-4">&nbsp;</td>
                    <td className="py-4">&nbsp;</td>
                    <td className="py-4">&nbsp;</td>
                    <td className="pr-6 py-4 text-right sticky right-0 bg-admin-deep border-l border-admin-border/10">
                      &nbsp;
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-admin-border/30 bg-admin-surface-low/30">
          <p className="text-xs text-admin-muted">
            Hiển thị{" "}
            <span className="font-bold text-admin-cream">
              {coursesList.length}
            </span>{" "}
            trên{" "}
            <span className="font-bold text-admin-cream">{totalItems}</span>{" "}
            khóa học
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className="p-2 border border-admin-border/30 rounded-lg text-admin-muted hover:bg-admin-surface-low hover:text-admin-cream disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => onPageChange(i + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-[12px] transition-all cursor-pointer ${
                  currentPage === i + 1
                    ? "bg-admin-pink text-white shadow-sm"
                    : "border border-admin-border/30 text-admin-muted hover:bg-admin-surface-low hover:text-admin-cream"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              className="p-2 border border-admin-border/30 rounded-lg text-admin-muted hover:bg-admin-surface-low hover:text-admin-cream disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
