"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getAdminCourse } from "@/features/courses/api";
import CourseManagementHeader from "@/features/courses/components/course-management-header";

export default function CourseManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const courseQuery = useQuery({
    queryKey: ["admin-course-detail", courseId],
    queryFn: () => getAdminCourse(courseId),
    enabled: Boolean(courseId),
    retry: 1,
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      <CourseManagementHeader
        courseId={courseId}
        course={courseQuery.data}
        isLoading={courseQuery.isLoading}
      />
      {courseQuery.isError ? (
        <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-5 text-sm text-red-300">
          Không thể tải thông tin khóa học. Vui lòng quay lại danh sách khóa học
          và thử lại.
        </div>
      ) : (
        children
      )}
    </div>
  );
}
