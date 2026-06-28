"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import CourseStudentAssessmentProgress from "@/features/courses/components/course-student-assessment-progress";
import CourseStudentCurriculumProgress from "@/features/courses/components/course-student-curriculum-progress";
import CourseStudentProgressOverview from "@/features/courses/components/course-student-progress-overview";
import CourseStudentProgressSkeleton from "@/features/courses/components/course-student-progress-skeleton";
import { useAdminCourseStudentProgress } from "@/features/courses/hooks/use-admin-course-students";

export default function AdminCourseStudentProgressPage() {
  const params = useParams<{ courseId: string; studentId: string }>();
  const { courseId, studentId } = params;
  const progressQuery = useAdminCourseStudentProgress(courseId, studentId);
  const [activeTab, setActiveTab] = useState<"lessons" | "assessments">(
    "lessons",
  );

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/admin/courses/${courseId}/students`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-admin-muted transition-colors hover:text-admin-pink focus-visible:outline-none focus-visible:text-admin-pink"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Danh sách học viên
        </Link>
        <h2 className="mt-3 text-lg font-bold text-admin-cream">
          Chi tiết tiến độ học tập
        </h2>
        <p className="mt-1 text-sm text-admin-muted">
          Đối chiếu curriculum để xác định những bài học viên đã hoàn thành và
          những bài cần tiếp tục.
        </p>
      </div>

      {progressQuery.isLoading ? (
        <CourseStudentProgressSkeleton />
      ) : progressQuery.isError || !progressQuery.data ? (
        <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-5 text-sm text-red-300">
          Không thể tải tiến độ học viên. Học viên có thể không còn thuộc khóa
          học này.
        </div>
      ) : (
        <>
          <CourseStudentProgressOverview data={progressQuery.data} />
          <div
            className="flex gap-1 border-b border-admin-border/30"
            role="tablist"
          >
            {(
              [
                ["lessons", "Bài học"],
                [
                  "assessments",
                  `Bài kiểm tra (${progressQuery.data.assessments.length})`,
                ],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={activeTab === value}
                onClick={() => setActiveTab(value)}
                className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-pink/50 ${
                  activeTab === value
                    ? "border-admin-pink text-admin-pink"
                    : "border-transparent text-admin-muted hover:text-admin-cream"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {activeTab === "lessons" ? (
            <CourseStudentCurriculumProgress
              chapters={progressQuery.data.chapters}
            />
          ) : (
            <CourseStudentAssessmentProgress
              studentId={studentId}
              assessments={progressQuery.data.assessments}
            />
          )}
        </>
      )}
    </div>
  );
}
