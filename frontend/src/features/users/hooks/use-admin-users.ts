"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserRole, UserStatus, AdminUserItem } from "@/features/users/types";
import { getAdminUsers, updateUserStatus } from "@/features/users/api";
import { getApiErrorMessage } from "@/lib/constants/messages";
import { toast } from "@/stores/toast-store";
import { useMeQuery } from "@/features/auth/hooks";

export function useAdminUsers() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useMeQuery();
  const canCreateTeacher = currentUser?.role === "admin";

  // Modals Visibility States
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [selectedStudentForEnroll, setSelectedStudentForEnroll] = useState<AdminUserItem | null>(null);
  const [selectedStudentForProgress, setSelectedStudentForProgress] = useState<AdminUserItem | null>(null);

  // Filter & Pagination States
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "all">("student");
  const [status, setStatus] = useState<UserStatus | "all">("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Reset to page 1 on filter changes
  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setCurrentPage(1);
  }, []);

  const handleRoleChange = useCallback((val: UserRole | "all") => {
    setRole(val);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((val: UserStatus | "all") => {
    setStatus(val);
    setCurrentPage(1);
  }, []);

  const handleLimitChange = useCallback((val: number) => {
    setLimit(val);
    setCurrentPage(1);
  }, []);

  // API query params
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit,
      role: role === "all" ? undefined : role,
      status: status === "all" ? undefined : status,
      search: search.trim() || undefined,
    }),
    [currentPage, limit, role, status, search]
  );

  // TanStack Query
  const usersQuery = useQuery({
    queryKey: ["admin-users", queryParams],
    queryFn: () => getAdminUsers(queryParams),
    placeholderData: (prev) => prev,
  });

  const usersList = usersQuery.data?.items || [];
  const totalItems = usersQuery.data?.pagination.totalItems ?? 0;
  const totalPages = usersQuery.data?.pagination.totalPages ?? 1;

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      updateUserStatus(userId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      const actionText = variables.status === "banned" ? "Khóa" : "Kích hoạt";
      toast.success(`${actionText} tài khoản người dùng thành công!`);
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Cập nhật trạng thái người dùng thất bại."));
    },
  });

  const handleToggleStatus = useCallback(async (userId: string, currentStatus: UserStatus) => {
    const nextStatus = currentStatus === "banned" ? "active" : "banned";
    await toggleStatusMutation.mutateAsync({ userId, status: nextStatus });
  }, [toggleStatusMutation]);

  const handleRefreshList = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  }, [queryClient]);

  return {
    currentUser,
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
  };
}
