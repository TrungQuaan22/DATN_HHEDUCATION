"use client";

import React from "react";
import { Subject, Grade } from "@/types/common";
import { CourseSummary } from "../types";
import CourseCard from "@/features/courses/components/course-card";
import { useCourseCatalog } from "../hooks/use-course-catalog";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

type CourseCatalogProps = {
  initialCourses: CourseSummary[];
};

const subjectsList: { key: Subject; label: string }[] = [
  { key: "math", label: "Toán" },
  { key: "physics", label: "Vật lý" },
  { key: "chemistry", label: "Hóa học" },
  { key: "literature", label: "Ngữ văn" },
  { key: "english", label: "Tiếng Anh" },
];

const gradesList: Grade[] = [9, 10, 11, 12];

export default function CourseCatalog({ initialCourses }: CourseCatalogProps) {
  const {
    searchQuery,
    setSearchQuery,
    selectedSubjects,
    selectedGrade,
    sortBy,
    setSortBy,
    currentPage,
    filteredAndSortedCourses,
    paginatedCourses,
    totalPages,
    handleSubjectToggle,
    handleGradeToggle,
    resetFilters,
    changePage,
  } = useCourseCatalog(initialCourses);

  return (
    <main className="min-h-screen pb-20 pt-24 bg-brand-dark transition-colors duration-200">
      {/* Hero Section */}
      <section className="bg-deep-black border-b border-border-dark py-16 transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-extrabold text-cream mb-4 leading-tight">
                Khám Phá Tri Thức,
                <br />
                Làm Chủ Tương Lai
              </h1>
              <p className="text-muted-taupe text-base md:text-lg max-w-xl leading-relaxed">
                Hệ thống bài giảng chuyên sâu từ các chuyên gia hàng đầu, giúp
                học sinh từ lớp 9 đến 12 đạt kết quả cao nhất trong các kỳ thi.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-auto">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-taupe group-focus-within:text-brand-pink transition-colors w-5 h-5" />
                <input
                  className="w-full md:w-[400px] pl-12 pr-4 py-4 rounded border border-border-dark focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition-all outline-none bg-deep-black text-cream shadow-sm text-sm"
                  placeholder="Tìm kiếm khóa học..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Layout */}
      <div className="max-w-[1200px] mx-auto px-6 mt-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-10">
            {/* Subjects filter */}
            <div>
              <div className="flex justify-between items-end mb-4 border-b border-border-dark pb-2">
                <h3 className="text-sm font-bold text-cream uppercase tracking-widest">
                  Môn Học
                </h3>
                {(selectedSubjects.length > 0 ||
                  selectedGrade !== null ||
                  searchQuery !== "") && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-brand-pink hover:underline flex items-center gap-1 cursor-pointer font-bold uppercase tracking-wider pb-0.5"
                  >
                    <Trash2 size={12} /> Đặt lại
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    checked={selectedSubjects.length === 0}
                    onChange={resetFilters}
                    className="w-5 h-5 rounded border-border-dark bg-deep-black text-brand-pink focus:ring-brand-pink cursor-pointer"
                    type="checkbox"
                  />
                  <span className="text-sm font-medium text-cream group-hover:text-brand-pink transition-colors">
                    Tất cả môn học
                  </span>
                </label>
                {subjectsList.map((subj) => (
                  <label
                    key={subj.key}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      checked={selectedSubjects.includes(subj.key)}
                      onChange={() => handleSubjectToggle(subj.key)}
                      className="w-5 h-5 rounded border-border-dark bg-deep-black text-brand-pink focus:ring-brand-pink cursor-pointer"
                      type="checkbox"
                    />
                    <span className="text-sm font-medium text-cream group-hover:text-brand-pink transition-colors">
                      {subj.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Grades filter */}
            <div>
              <div className="border-b border-border-dark pb-2 mb-4">
                <h3 className="text-sm font-bold text-cream uppercase tracking-widest">
                  Khối Lớp
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleGradeToggle(null as any)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                    selectedGrade === null
                      ? "bg-brand-pink text-white border-brand-pink"
                      : "border-border-dark text-cream hover:bg-deep-black"
                  }`}
                >
                  Tất cả
                </button>
                {gradesList.map((grade) => (
                  <button
                    key={grade}
                    onClick={() => handleGradeToggle(grade)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                      selectedGrade === grade
                        ? "bg-brand-pink text-white border-brand-pink"
                        : "border-border-dark text-cream hover:bg-deep-black"
                    }`}
                  >
                    Lớp {grade}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Grid Area */}
          <div className="flex-grow">
            {filteredAndSortedCourses.length > 0 ? (
              <>
                {/* Header count & sort bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <p className="text-sm font-medium text-muted-taupe">
                    Hiển thị{" "}
                    <span className="text-cream font-bold">
                      {filteredAndSortedCourses.length}
                    </span>{" "}
                    khóa học
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-taupe">
                      Sắp xếp:
                    </span>
                    <select
                      className="bg-deep-black border border-border-dark rounded-lg px-3 py-1.5 focus:ring-brand-pink text-cream text-sm cursor-pointer outline-none"
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value as
                            | "newest"
                            | "hotest"
                            | "priceAsc"
                            | "priceDesc",
                        )
                      }
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="hotest">Nổi bật nhất</option>
                      <option value="priceAsc">Giá thấp đến cao</option>
                      <option value="priceDesc">Giá cao đến thấp</option>
                    </select>
                  </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedCourses.map((course) => (
                    <div key={course.id} className="h-full">
                      <CourseCard course={course} aspectRatio="video" />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-16 flex justify-center items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => changePage(Math.max(1, currentPage - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-dark text-cream hover:bg-deep-black disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => changePage(i + 1)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm cursor-pointer transition-all ${
                          currentPage === i + 1
                            ? "bg-brand-pink text-white"
                            : "border border-border-dark text-cream hover:bg-deep-black"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        changePage(Math.min(totalPages, currentPage + 1))
                      }
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-dark text-cream hover:bg-deep-black disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <EmptyState
                icon={
                  <SlidersHorizontal className="w-10 h-10 text-muted-taupe" />
                }
                title="Không tìm thấy khóa học"
                description="Chúng tôi không tìm thấy kết quả phù hợp với lựa chọn của bạn. Vui lòng thử lại với các tiêu chí lọc khác."
                action={
                  <button
                    onClick={resetFilters}
                    className="bg-brand-pink text-white px-6 py-3 rounded-lg text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  >
                    Đặt lại tất cả bộ lọc
                  </button>
                }
                className="py-16 border-none bg-transparent"
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
