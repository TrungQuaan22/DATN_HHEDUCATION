"use client";

import { useParams } from "next/navigation";

import CourseStudentFilters from "@/features/courses/components/course-student-filters";
import CourseStudentStats from "@/features/courses/components/course-student-stats";
import CourseStudentsSkeleton from "@/features/courses/components/course-students-skeleton";
import CourseStudentsTable from "@/features/courses/components/course-students-table";
import { useAdminCourseStudents } from "@/features/courses/hooks/use-admin-course-students";

export default function AdminCourseStudentsPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const {
    page,
    setPage,
    searchInput,
    setSearchInput,
    progressStatus,
    setProgressStatus,
    query,
  } = useAdminCourseStudents(courseId);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-admin-cream">
          Học viên trong khóa học
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-admin-muted">
          Theo dõi tiến độ chung và mở curriculum của từng học viên để biết
          những bài đã hoàn thành hoặc còn thiếu.
        </p>
      </div>

      <CourseStudentStats
        stats={query.data?.stats}
        isLoading={query.isLoading}
      />
      <CourseStudentFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        progressStatus={progressStatus}
        onProgressStatusChange={setProgressStatus}
      />

      {query.isError ? (
        <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-5 text-sm text-red-300">
          Không thể tải danh sách học viên. Vui lòng thử lại sau.
        </div>
      ) : query.isLoading ? (
        <CourseStudentsSkeleton />
      ) : (
        <CourseStudentsTable
          courseId={courseId}
          students={query.data?.items ?? []}
          page={page}
          totalPages={query.data?.pagination.totalPages ?? 0}
          totalItems={query.data?.pagination.totalItems ?? 0}
          isFetching={query.isFetching}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
