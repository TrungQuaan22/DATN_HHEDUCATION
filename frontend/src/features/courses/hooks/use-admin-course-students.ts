"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAdminCourseStudentProgress, getAdminCourseStudents } from "../api";
import type { CourseStudentProgressStatus } from "../types";

export function useAdminCourseStudents(courseId: string) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [progressStatus, setProgressStatus] = useState<
    CourseStudentProgressStatus | ""
  >("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const query = useQuery({
    queryKey: ["admin-course-students", courseId, page, search, progressStatus],
    queryFn: () =>
      getAdminCourseStudents(courseId, {
        page,
        limit: 20,
        search: search || undefined,
        progressStatus: progressStatus || undefined,
      }),
    enabled: Boolean(courseId),
    placeholderData: (previous) => previous,
  });

  const updateProgressStatus = (status: CourseStudentProgressStatus | "") => {
    setProgressStatus(status);
    setPage(1);
  };

  return {
    page,
    setPage,
    searchInput,
    setSearchInput,
    progressStatus,
    setProgressStatus: updateProgressStatus,
    query,
  };
}

export function useAdminCourseStudentProgress(
  courseId: string,
  studentId: string,
) {
  return useQuery({
    queryKey: ["admin-course-student-progress", courseId, studentId],
    queryFn: () => getAdminCourseStudentProgress(courseId, studentId),
    enabled: Boolean(courseId && studentId),
  });
}
