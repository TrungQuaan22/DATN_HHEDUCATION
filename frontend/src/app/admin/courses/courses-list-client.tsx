"use client";

import React from "react";
import { Plus } from "lucide-react";
import CourseCreateEditModal from "@/features/courses/components/course-create-modal";
import { useAdminCourses } from "@/features/courses/hooks/use-admin-courses";
import CoursesFilters from "./components/courses-filters";
import CoursesTable from "./components/courses-table";
import CoursesStats from "./components/courses-stats";

export default function CoursesListClient() {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingCourse,
    handleEditCourse,
    handleCloseModal,
    search,
    handleSearchChange,
    status,
    handleStatusChange,
    subject,
    handleSubjectChange,
    grade,
    handleGradeChange,
    isFeaturedOnly,
    handleFeaturedOnlyChange,
    currentPage,
    setCurrentPage,
    coursesList,
    totalItems,
    totalPages,
    coursesQuery,
    publishMutation,
    archiveMutation,
    handlePublish,
    handleArchive,
    handleRefreshList,
    kpis,
  } = useAdminCourses();

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-admin-cream">
            Quản Lý Khóa Học
          </h2>
          <p className="text-sm text-admin-muted mt-1">
            Quản lý thông tin khóa học, trạng thái phát hành và xây dựng nội dung học tập.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-admin-pink text-white px-6 py-2.5 rounded font-bold text-[14px] flex items-center gap-2 hover:shadow-lg hover:shadow-admin-pink/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          type="button"
        >
          <Plus size={16} />
          Tạo khóa học mới
        </button>
      </div>

      {/* Filters & Search Toolbar with Debounce */}
      <CoursesFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        subject={subject}
        onSubjectChange={handleSubjectChange}
        grade={grade}
        onGradeChange={handleGradeChange}
        isFeaturedOnly={isFeaturedOnly}
        onFeaturedOnlyChange={handleFeaturedOnlyChange}
      />

      {/* Main Table Container */}
      <CoursesTable
        coursesList={coursesList}
        isLoading={coursesQuery.isLoading}
        isFetching={coursesQuery.isFetching}
        isActionPending={publishMutation.isPending || archiveMutation.isPending}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPublish={handlePublish}
        onArchive={handleArchive}
        onEdit={handleEditCourse}
      />

      {/* Dashboard Stats Summary */}
      <CoursesStats kpis={kpis} />

      {/* Create/Edit Course Modal */}
      <CourseCreateEditModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleRefreshList}
        initialData={editingCourse}
      />
    </div>
  );
}
