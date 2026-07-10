"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Subject, Grade } from "@/types/common";
import {
  getAdminCourses,
  getAdminCourseStats,
  publishAdminCourse,
  archiveAdminCourse,
} from "@/features/courses/api";
import { CourseStatus, AdminCourseSummary } from "@/features/courses/types";
import { getApiErrorMessage, UI_MESSAGES } from "@/lib/constants/messages";
import { toast } from "@/stores/toast-store";

const ITEMS_PER_PAGE = 5;

export function useAdminCourses() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourseSummary | null>(null);

  const handleEditCourse = useCallback((course: AdminCourseSummary) => {
    setEditingCourse(course);
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setEditingCourse(null);
  }, []);

  // Filter States
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CourseStatus | "all">("all");
  const [subject, setSubject] = useState<Subject | "all">("all");
  const [grade, setGrade] = useState<Grade | "all">("all");
  const [isFeaturedOnly, setIsFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Memoized filter event handlers
  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((val: CourseStatus | "all") => {
    setStatus(val);
    setCurrentPage(1);
  }, []);

  const handleSubjectChange = useCallback((val: Subject | "all") => {
    setSubject(val);
    setCurrentPage(1);
  }, []);

  const handleGradeChange = useCallback((val: Grade | "all") => {
    setGrade(val);
    setCurrentPage(1);
  }, []);

  const handleFeaturedOnlyChange = useCallback((val: boolean) => {
    setIsFeaturedOnly(val);
    setCurrentPage(1);
  }, []);

  // API query params
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      status: status === "all" ? undefined : status,
      subject: subject === "all" ? undefined : subject,
      grade: grade === "all" ? undefined : grade,
      isFeatured: isFeaturedOnly ? true : undefined,
      search: search.trim() || undefined,
    }),
    [currentPage, status, subject, grade, isFeaturedOnly, search]
  );

  // Query for table
  const coursesQuery = useQuery({
    queryKey: ["admin-courses", queryParams],
    queryFn: () => getAdminCourses(queryParams),
    placeholderData: (prev) => prev,
  });

  // Query for stats
  const statsQuery = useQuery({
    queryKey: ["admin-courses-stats"],
    queryFn: getAdminCourseStats,
  });

  const coursesList = coursesQuery.data?.items || [];
  const totalItems = coursesQuery.data?.pagination.totalItems ?? 0;
  const totalPages = coursesQuery.data?.pagination.totalPages ?? 1;

  // Mutations
  const publishMutation = useMutation({
    mutationFn: publishAdminCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-courses-stats"] });
      toast.success(UI_MESSAGES.courses.publishSuccess);
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, UI_MESSAGES.courses.publishFailed));
    },
  });

  const archiveMutation = useMutation({
    mutationFn: archiveAdminCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-courses-stats"] });
      toast.success(UI_MESSAGES.courses.archiveSuccess);
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, UI_MESSAGES.courses.archiveFailed));
    },
  });

  const handlePublish = useCallback(async (courseId: string) => {
    await publishMutation.mutateAsync(courseId);
  }, [publishMutation]);

  const handleArchive = useCallback(async (courseId: string) => {
    await archiveMutation.mutateAsync(courseId);
  }, [archiveMutation]);

  const handleRefreshList = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    queryClient.invalidateQueries({ queryKey: ["admin-courses-stats"] });
  }, [queryClient]);

  const kpis = statsQuery.data ?? {
    active: 0,
    draft: 0,
    teachers: 0,
    monthlyRevenue: 0,
  };

  return {
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
  };
}
