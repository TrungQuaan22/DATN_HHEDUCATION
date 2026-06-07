"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMeQuery } from "@/features/auth/hooks";
import {
  useLearningCourseOverviewQuery,
  useLearningLessonDetailQuery,
  useUpdateProgressMutation,
} from "@/features/courses/hooks";

export function useLessonProgress(
  activeLessonId: string | null,
  initialIsCompleted: boolean = false,
  onCompleted?: () => void
) {
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const isCompletedRef = React.useRef(initialIsCompleted);
  const completedLessonIdsRef = React.useRef(new Set<string>());

  const setLessonCompleted = useCallback((completed: boolean) => {
    isCompletedRef.current = completed;
    setIsCompleted(completed);
  }, []);
  
  const { mutateAsync: updateProgress } = useUpdateProgressMutation({
    invalidateOnSuccess: false,
  });

  const saveProgress = useCallback(
    async (watchedSeconds: number, lastPositionSec: number) => {
      if (!activeLessonId) return;
      try {
        const res = await updateProgress({
          lessonId: activeLessonId,
          watchedSeconds,
          lastPositionSec,
        });
        if (res) {
          if (
            res.isCompleted &&
            !isCompletedRef.current &&
            !completedLessonIdsRef.current.has(activeLessonId)
          ) {
            isCompletedRef.current = true;
            completedLessonIdsRef.current.add(activeLessonId);
            setIsCompleted(true);
            onCompleted?.();
          }
        }
      } catch (err) {
        console.error("Không thể lưu tiến trình:", err);
      }
    },
    [activeLessonId, updateProgress, onCompleted]
  );

  return {
    isLessonCompleted: isCompleted,
    setIsLessonCompleted: setLessonCompleted,
    saveProgress,
  };
}

export function useStudentLearning() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const lessonId = searchParams.get("lessonId");

  const {
    data: course,
    isLoading,
    refetch: refetchCourse,
  } = useLearningCourseOverviewQuery(slug);

  const { data: user } = useMeQuery();

  const [activeTab, setActiveTab] = useState<"description" | "materials">(
    "description"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const allLessons = useMemo(() => {
    if (!course) return [];
    return course.chapters.flatMap((ch) => ch.lessons);
  }, [course]);

  // Redirect to first lesson if no lessonId is selected
  useEffect(() => {
    if (course && !lessonId && allLessons.length > 0) {
      const firstLessonId = allLessons[0].id;
      router.replace(`/student/courses/${slug}?lessonId=${firstLessonId}`);
    }
  }, [course, lessonId, allLessons, slug, router]);

  const activeLessonSummary = useMemo(() => {
    if (!lessonId) return null;
    return allLessons.find((lesson) => lesson.id === lessonId) || null;
  }, [lessonId, allLessons]);

  const activeLessonId = activeLessonSummary?.id || null;
  
  const { data: activeLesson, isLoading: isLessonLoading } =
    useLearningLessonDetailQuery(activeLessonId);

  const activeChapter = useMemo(() => {
    if (!course || !activeLessonId) return null;
    return (
      course.chapters.find((ch) =>
        ch.lessons.some((l) => l.id === activeLessonId)
      ) || null
    );
  }, [course, activeLessonId]);

  const onCompletedCallback = useCallback(() => {
    refetchCourse();
  }, [refetchCourse]);

  const {
    isLessonCompleted,
    setIsLessonCompleted,
    saveProgress,
  } = useLessonProgress(
    activeLessonId,
    activeLesson?.progress?.isCompleted || activeLessonSummary?.progress?.isCompleted || false,
    onCompletedCallback
  );

  // Sync state with activeLesson on load/change
  useEffect(() => {
    const lessonProgress = activeLesson?.progress;
    const summaryProgress = activeLessonSummary?.progress;

    if (lessonProgress || summaryProgress) {
      setIsLessonCompleted(
        Boolean(lessonProgress?.isCompleted || summaryProgress?.isCompleted)
      );
    }
  }, [activeLesson, activeLessonSummary, setIsLessonCompleted]);

  const openLesson = useCallback(
    (id: string) => {
      router.push(`/student/courses/${slug}?lessonId=${id}`);
      setIsMobileMenuOpen(false);
    },
    [router, slug]
  );

  const currentLessonIndex = useMemo(() => {
    if (!activeLessonId) return -1;
    return allLessons.findIndex((l) => l.id === activeLessonId);
  }, [activeLessonId, allLessons]);

  useEffect(() => {
    if (!slug || currentLessonIndex < 0) {
      return;
    }

    const lessonIdsToPrefetch = [
      allLessons[currentLessonIndex - 1]?.id,
      allLessons[currentLessonIndex]?.id,
      allLessons[currentLessonIndex + 1]?.id,
    ].filter(Boolean);

    lessonIdsToPrefetch.forEach((id) => {
      router.prefetch(`/student/courses/${slug}?lessonId=${id}`);
    });
  }, [allLessons, currentLessonIndex, router, slug]);

  const hasPreviousLesson = currentLessonIndex > 0;
  const hasNextLesson =
    currentLessonIndex < allLessons.length - 1 && currentLessonIndex !== -1;

  const goToPreviousLesson = useCallback(() => {
    if (hasPreviousLesson) {
      openLesson(allLessons[currentLessonIndex - 1].id);
    }
  }, [hasPreviousLesson, currentLessonIndex, allLessons, openLesson]);

  const goToNextLesson = useCallback(() => {
    if (hasNextLesson) {
      openLesson(allLessons[currentLessonIndex + 1].id);
    }
  }, [hasNextLesson, currentLessonIndex, allLessons, openLesson]);

  const courseProgressPercentage = useMemo(() => {
    if (!course || course.totalLessons <= 0) return 0;
    return Math.round((course.completedLessons / course.totalLessons) * 100);
  }, [course]);

  const isUnknownLesson = !!lessonId && !activeLessonSummary;

  return {
    slug,
    lessonId,
    course,
    isLoading,
    user,
    activeTab,
    setActiveTab,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    allLessons,
    activeLessonSummary,
    activeLessonId,
    activeLesson,
    isLessonLoading,
    activeChapter,
    isLessonCompleted,
    saveProgress,
    openLesson,
    courseProgressPercentage,
    isUnknownLesson,
    currentLessonIndex,
    hasPreviousLesson,
    hasNextLesson,
    goToPreviousLesson,
    goToNextLesson,
  };
}
