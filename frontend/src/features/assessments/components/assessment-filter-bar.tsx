import React from "react";
import { Search } from "lucide-react";
import { Subject } from "@/types/common";
import { AdminCourseSummary } from "@/features/courses/types";

interface AssessmentFilterBarProps {
  activeTab: "public" | "courses" | "unplaced";
  setActiveTab: (tab: "public" | "courses" | "unplaced") => void;
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
  courses: AdminCourseSummary[];
  isLoadingCourses: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterSubject: string;
  setFilterSubject: (subject: string) => void;
  filterGrade: string;
  setFilterGrade: (grade: string) => void;
  filterGradingType: string;
  setFilterGradingType: (type: string) => void;
  subjectLabels: Record<string, string>;
  gradingLabels: Record<string, string>;
}

export function AssessmentFilterBar({
  activeTab,
  setActiveTab,
  selectedCourseId,
  setSelectedCourseId,
  courses,
  isLoadingCourses,
  searchQuery,
  setSearchQuery,
  filterSubject,
  setFilterSubject,
  filterGrade,
  setFilterGrade,
  filterGradingType,
  setFilterGradingType,
  subjectLabels,
  gradingLabels,
}: AssessmentFilterBarProps) {
  const isFiltered = filterSubject || filterGrade || filterGradingType;

  const handleClearFilters = () => {
    setFilterSubject("");
    setFilterGrade("");
    setFilterGradingType("");
  };

  return (
    <div className="space-y-4 bg-admin-surface-low p-4 rounded-xl border border-admin-border/60">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Tab Selector */}
          <div className="flex rounded-lg bg-admin-bg p-1 border border-admin-border/80">
            <button
              onClick={() => setActiveTab("public")}
              className={`rounded-md px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "public"
                  ? "bg-admin-pink text-admin-bg shadow-sm"
                  : "text-admin-muted hover:text-admin-cream"
              }`}
            >
              Luyện tập tự do
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`rounded-md px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "courses"
                  ? "bg-admin-pink text-admin-bg shadow-sm"
                  : "text-admin-muted hover:text-admin-cream"
              }`}
            >
              Theo khóa học
            </button>
            <button
              onClick={() => setActiveTab("unplaced")}
              className={`rounded-md px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "unplaced"
                  ? "bg-admin-pink text-admin-bg shadow-sm"
                  : "text-admin-muted hover:text-admin-cream"
              }`}
            >
              Chưa phân bổ
            </button>
          </div>

          {/* Course Select Dropdown */}
          {activeTab === "courses" && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-admin-muted">
                Khóa học:
              </span>
              {isLoadingCourses ? (
                <span className="text-xs text-admin-muted animate-pulse">
                  Đang tải...
                </span>
              ) : courses.length === 0 ? (
                <span className="text-xs text-amber-500 font-bold">
                  Không có khóa học quản lý
                </span>
              ) : (
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="rounded-lg border border-admin-border bg-admin-bg px-3 py-1.5 text-xs font-bold text-admin-cream outline-none focus:border-admin-pink transition cursor-pointer"
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      [{course.grade} -{" "}
                      {subjectLabels[course.subject as Subject] ||
                        course.subject}
                      ] {course.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search
            className="absolute left-3 top-2.5 text-admin-muted"
            size={16}
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bài kiểm tra"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-admin-border bg-admin-bg py-2 pl-9 pr-4 text-xs text-admin-cream outline-none placeholder-admin-muted focus:border-admin-pink"
          />
        </div>
      </div>

      {/* Advanced filters */}
      <div className="flex flex-wrap items-center gap-4 border-t border-admin-border/40 pt-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-admin-muted">Môn học:</span>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="rounded-lg border border-admin-border bg-admin-bg px-3 py-1.5 text-xs font-bold text-admin-cream outline-none focus:border-admin-pink cursor-pointer"
          >
            <option value="">Tất cả môn học</option>
            {Object.entries(subjectLabels).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-admin-muted">Khối lớp:</span>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="rounded-lg border border-admin-border bg-admin-bg px-3 py-1.5 text-xs font-bold text-admin-cream outline-none focus:border-admin-pink cursor-pointer"
          >
            <option value="">Tất cả khối</option>
            {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(
              (gradeVal) => (
                <option key={gradeVal} value={gradeVal}>
                  Lớp {gradeVal}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-admin-muted">
            Hình thức chấm:
          </span>
          <select
            value={filterGradingType}
            onChange={(e) => setFilterGradingType(e.target.value)}
            className="rounded-lg border border-admin-border bg-admin-bg px-3 py-1.5 text-xs font-bold text-admin-cream outline-none focus:border-admin-pink cursor-pointer"
          >
            <option value="">Tất cả hình thức</option>
            {Object.entries(gradingLabels).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {isFiltered && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-bold text-admin-pink hover:underline cursor-pointer"
          >
            XĂ³a bá»™ lá»c
          </button>
        )}
      </div>
    </div>
  );
}

