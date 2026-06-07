"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useAdminUsers } from "@/features/users/hooks/use-admin-users";
import UsersFilters from "./components/users-filters";
import UsersTable from "./components/users-table";
import TeacherCreateModal from "./components/teacher-create-modal";
import EnrollStudentModal from "./components/enroll-student-modal";
import ProgressPlaceholderModal from "./components/progress-placeholder-modal";
import UsersStats from "./components/users-stats";

export default function UsersListClient() {
  const {
    canCreateTeacher,
    isTeacherModalOpen,
    setIsTeacherModalOpen,
    selectedStudentForEnroll,
    setSelectedStudentForEnroll,
    selectedStudentForProgress,
    setSelectedStudentForProgress,
    search,
    handleSearchChange,
    role,
    handleRoleChange,
    status,
    handleStatusChange,
    currentPage,
    setCurrentPage,
    limit,
    handleLimitChange,
    usersQuery,
    usersList,
    totalItems,
    totalPages,
    toggleStatusMutation,
    handleToggleStatus,
    handleRefreshList,
  } = useAdminUsers();

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-admin-cream">
            Quản Lý Người Dùng
          </h2>
          <p className="text-sm text-admin-muted mt-1">
            Xem danh sách thành viên hệ thống, phân quyền và gán quyền học tập thủ công.
          </p>
        </div>
        {canCreateTeacher && (
          <button
            onClick={() => setIsTeacherModalOpen(true)}
            className="bg-admin-pink text-white px-6 py-2.5 rounded font-bold text-[14px] flex items-center gap-2 hover:shadow-lg hover:shadow-admin-pink/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer font-sans"
            type="button"
          >
            <Plus size={16} />
            Tạo giảng viên mới
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <UsersFilters
        search={search}
        onSearchChange={handleSearchChange}
        role={role}
        onRoleChange={handleRoleChange}
        status={status}
        onStatusChange={handleStatusChange}
      />

      {/* Main Table */}
      <UsersTable
        usersList={usersList}
        isLoading={usersQuery.isLoading}
        isFetching={usersQuery.isFetching}
        isActionPending={toggleStatusMutation.isPending}
        currentPage={currentPage}
        limit={limit}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onLimitChange={handleLimitChange}
        onToggleStatus={handleToggleStatus}
        onEnrollClick={setSelectedStudentForEnroll}
        onProgressClick={setSelectedStudentForProgress}
      />

      <UsersStats stats={usersQuery.data?.stats} />

      {/* Create Teacher Modal */}
      <TeacherCreateModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onSuccess={handleRefreshList}
      />

      {/* Manual Enrollment Modal */}
      <EnrollStudentModal
        isOpen={!!selectedStudentForEnroll}
        onClose={() => setSelectedStudentForEnroll(null)}
        student={selectedStudentForEnroll}
      />

      {/* Progress Checker Modal */}
      <ProgressPlaceholderModal
        isOpen={!!selectedStudentForProgress}
        onClose={() => setSelectedStudentForProgress(null)}
        student={selectedStudentForProgress}
      />
    </div>
  );
}
