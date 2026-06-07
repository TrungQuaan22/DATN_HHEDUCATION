"use client";

import { useState, useMemo, useCallback } from "react";
import { Subject, Grade } from "@/types/common";
import { CourseSummary } from "../types";

export function useCourseCatalog(initialCourses: CourseSummary[] = []) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [sortBy, setSortBy] = useState<
    "newest" | "hotest" | "priceAsc" | "priceDesc"
  >("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort logic
  const filteredAndSortedCourses = useMemo(() => {
    let result = [...initialCourses];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    // Subject filters
    if (selectedSubjects.length > 0) {
      result = result.filter((c) => selectedSubjects.includes(c.subject));
    }

    // Grade filter
    if (selectedGrade !== null) {
      result = result.filter((c) => c.grade === selectedGrade);
    }

    // Sorting
    if (sortBy === "newest") {
      result.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortBy === "hotest") {
      result.sort(
        (a, b) =>
          Number(b.isFeatured) - Number(a.isFeatured) ||
          b.id.localeCompare(a.id)
      );
    } else if (sortBy === "priceAsc") {
      result.sort((a, b) => {
        const pA = a.salePrice ?? a.price;
        const pB = b.salePrice ?? b.price;
        return pA - pB;
      });
    } else if (sortBy === "priceDesc") {
      result.sort((a, b) => {
        const pA = a.salePrice ?? a.price;
        const pB = b.salePrice ?? b.price;
        return pB - pA;
      });
    }

    return result;
  }, [initialCourses, searchQuery, selectedSubjects, selectedGrade, sortBy]);

  const itemsPerPage = 6;

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCourses.slice(start, start + itemsPerPage);
  }, [filteredAndSortedCourses, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedCourses.length / itemsPerPage) || 1;
  }, [filteredAndSortedCourses]);

  const handleSubjectToggle = useCallback((subj: Subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
    setCurrentPage(1);
  }, []);

  const handleGradeToggle = useCallback((grade: Grade) => {
    setSelectedGrade((prev) => (prev === grade ? null : grade));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedSubjects([]);
    setSelectedGrade(null);
    setSortBy("newest");
    setCurrentPage(1);
  }, []);

  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  return {
    searchQuery,
    setSearchQuery: updateSearchQuery,
    selectedSubjects,
    setSelectedSubjects,
    selectedGrade,
    setSelectedGrade,
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
  };
}
