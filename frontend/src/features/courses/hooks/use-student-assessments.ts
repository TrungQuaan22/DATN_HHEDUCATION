"use client";

import { useState, useMemo, useCallback } from "react";
import { AssessmentItem, mockAssessments } from "../assessments-mock";

export type FilterId = "all" | "upcoming" | "not_done" | "completed";

export function useStudentAssessments() {
  const [assessmentFilter, setAssessmentFilter] = useState<FilterId>("all");
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentItem | null>(null);
  const [activeModal, setActiveModal] = useState<"start" | "result" | null>(
    null
  );

  // Statistics calculation
  const stats = useMemo(() => {
    const total = mockAssessments.length;
    const completed = mockAssessments.filter(
      (a) => a.status === "completed"
    ).length;
    const notDone = mockAssessments.filter(
      (a) => a.status === "not_done" || a.status === "upcoming"
    ).length;
    const expired = mockAssessments.filter(
      (a) => a.status === "expired"
    ).length;

    // GPA calculation for official exams
    const examGrades = mockAssessments.filter(
      (a) =>
        a.status === "completed" && a.type === "exam" && a.score !== undefined
    );
    const averageGPA =
      examGrades.length > 0
        ? (
            examGrades.reduce((sum, item) => sum + (item.score || 0), 0) /
            examGrades.length
          ).toFixed(2)
        : "0.0";

    return {
      total,
      completed,
      notDone,
      expired,
      averageGPA,
    };
  }, []);

  // Filter logic
  const filteredAssessments = useMemo(() => {
    return mockAssessments.filter((item) => {
      if (assessmentFilter === "all") return true;
      if (assessmentFilter === "upcoming") return item.status === "upcoming";
      if (assessmentFilter === "not_done")
        return item.status === "not_done" || item.status === "expired";
      if (assessmentFilter === "completed") return item.status === "completed";
      return true;
    });
  }, [assessmentFilter]);

  const openStartModal = useCallback((assessment: AssessmentItem) => {
    setSelectedAssessment(assessment);
    setActiveModal("start");
  }, []);

  const openResultModal = useCallback((assessment: AssessmentItem) => {
    setSelectedAssessment(assessment);
    setActiveModal("result");
  }, []);

  const closeModal = useCallback(() => {
    setSelectedAssessment(null);
    setActiveModal(null);
  }, []);

  return {
    assessmentFilter,
    setAssessmentFilter,
    selectedAssessment,
    activeModal,
    stats,
    filteredAssessments,
    openStartModal,
    openResultModal,
    closeModal,
  };
}
