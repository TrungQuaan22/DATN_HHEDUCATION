"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DropResult } from "@hello-pangea/dnd";
import {
  getAdminCourse,
  publishAdminCourse,
  archiveAdminCourse,
  createAdminChapter,
  updateAdminChapter,
  deleteAdminChapter,
  reorderAdminChapters,
  createAdminLesson,
  updateAdminLesson,
  deleteAdminLesson,
  reorderAdminLessons,
} from "../api";
import {
  AdminCourseDetail,
  AdminCourseChapter,
  AdminCourseLesson,
  AdminLessonRequest,
} from "../types";
import { UI_MESSAGES, getApiErrorMessage } from "@/lib/constants/messages";

export function useCurriculumBuilder() {
  const params = useParams();
  const queryClient = useQueryClient();
  const courseId = params.courseId as string;

  // Local state to manage curriculum
  const [chapters, setChapters] = useState<AdminCourseChapter[]>([]);
  const [courseInfo, setCourseInfo] = useState<{
    title: string;
    status: "draft" | "published" | "archived";
  } | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  // Collapse/Expand state for chapters
  const [expandedChapters, setExpandedChapters] = useState<
    Record<string, boolean>
  >({
    "chapter-1": true,
  });

  // Modals state
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [targetChapterIdForLesson, setTargetChapterIdForLesson] = useState<
    string | null
  >(null);
  const [editingLesson, setEditingLesson] = useState<{
    lesson: AdminCourseLesson;
    chapterId: string;
  } | null>(null);

  // Toast Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  // Set mounted state
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Fetch Course Detail
  const { data: apiData, isLoading } = useQuery({
    queryKey: ["admin-course-detail", courseId],
    queryFn: () => getAdminCourse(courseId),
    retry: 1,
  });

  // Sync API data to local state on successful load
  useEffect(() => {
    if (apiData) {
      setChapters(apiData.chapters || []);
      setCourseInfo({
        title: apiData.title,
        status: apiData.status,
      });
    }
  }, [apiData]);

  // Toast helper
  const showToast = useCallback((
    message: string,
    type: "success" | "info" | "error" = "success"
  ) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  // Chapter Toggle Expand
  const toggleChapter = useCallback((chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  }, []);

  // --- API Mutations ---

  const publishMutation = useMutation({
    mutationFn: () => publishAdminCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-course-detail", courseId],
      });
      showToast(UI_MESSAGES.courses.publishSuccess);
    },
    onError: () => {
      if (courseInfo) {
        setCourseInfo({ ...courseInfo, status: "published" });
      }
      showToast(UI_MESSAGES.demo.published, "info");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveAdminCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-course-detail", courseId],
      });
      showToast(UI_MESSAGES.courses.archiveSuccess);
    },
    onError: () => {
      if (courseInfo) {
        setCourseInfo({ ...courseInfo, status: "archived" });
      }
      showToast(UI_MESSAGES.demo.archived, "info");
    },
  });

  const reorderChaptersMutation = useMutation({
    mutationFn: (chapterIds: string[]) =>
      reorderAdminChapters(courseId, chapterIds),
    onMutate: async (chapterIds) => {
      await queryClient.cancelQueries({
        queryKey: ["admin-course-detail", courseId],
      });
      const previousCourse =
        queryClient.getQueryData<AdminCourseDetail>([
          "admin-course-detail",
          courseId,
        ]);

      if (previousCourse) {
        const reorderedChapters = chapterIds.map((id, idx) => {
          const ch = previousCourse.chapters.find((c) => c.id === id)!;
          return { ...ch, orderIndex: idx + 1 };
        });
        queryClient.setQueryData(["admin-course-detail", courseId], {
          ...previousCourse,
          chapters: reorderedChapters,
        });
      }

      return { previousCourse };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousCourse) {
        queryClient.setQueryData(
          ["admin-course-detail", courseId],
          context.previousCourse,
        );
        setChapters(context.previousCourse.chapters || []);
      }
      showToast(UI_MESSAGES.chapters.reorderFailed, "error");
    },
    onSuccess: () => {
      showToast(UI_MESSAGES.chapters.reorderSuccess);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-course-detail", courseId],
      });
    },
  });

  const reorderLessonsMutation = useMutation({
    mutationFn: ({
      chapterId,
      lessonIds,
    }: {
      chapterId: string;
      lessonIds: string[];
    }) => reorderAdminLessons(chapterId, lessonIds),
    onMutate: async ({ chapterId, lessonIds }) => {
      await queryClient.cancelQueries({
        queryKey: ["admin-course-detail", courseId],
      });
      const previousCourse =
        queryClient.getQueryData<AdminCourseDetail>([
          "admin-course-detail",
          courseId,
        ]);

      if (previousCourse) {
        const updatedChapters = previousCourse.chapters.map((ch) => {
          if (ch.id === chapterId) {
            const reorderedLessons = lessonIds.map((id, idx) => {
              const les = ch.lessons.find((l) => l.id === id)!;
              return { ...les, orderIndex: idx + 1 };
            });
            return { ...ch, lessons: reorderedLessons };
          }
          return ch;
        });
        queryClient.setQueryData(["admin-course-detail", courseId], {
          ...previousCourse,
          chapters: updatedChapters,
        });
      }

      return { previousCourse };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousCourse) {
        queryClient.setQueryData(
          ["admin-course-detail", courseId],
          context.previousCourse,
        );
        setChapters(context.previousCourse.chapters || []);
      }
      showToast(UI_MESSAGES.lessons.reorderFailed, "error");
    },
    onSuccess: () => {
      showToast(UI_MESSAGES.lessons.reorderSuccess);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-course-detail", courseId],
      });
    },
  });

  const saveChapterMutation = useMutation({
    mutationFn: async ({ id, title }: { id?: string; title: string }) => {
      if (id) {
        return updateAdminChapter(id, title);
      } else {
        return createAdminChapter(courseId, title);
      }
    },
    onSuccess: (_, variables) => {
      showToast(
        variables.id
          ? UI_MESSAGES.chapters.updateSuccess
          : UI_MESSAGES.chapters.createSuccess
      );
      queryClient.invalidateQueries({
        queryKey: ["admin-course-detail", courseId],
      });
    },
    onError: (err) => {
      showToast(
        getApiErrorMessage(err, UI_MESSAGES.common.unknownError),
        "error"
      );
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: deleteAdminChapter,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-course-detail", courseId],
      });
      showToast(UI_MESSAGES.chapters.deleteSuccess);
    },
    onError: (err) => {
      showToast(
        getApiErrorMessage(err, UI_MESSAGES.common.unknownError),
        "error"
      );
    },
  });

  const saveLessonMutation = useMutation({
    mutationFn: async ({
      id,
      chapterId,
      data,
    }: {
      id?: string;
      chapterId?: string;
      data: AdminLessonRequest;
    }) => {
      if (id) {
        return updateAdminLesson(id, data);
      } else if (chapterId) {
        return createAdminLesson(chapterId, data);
      }
      throw new Error("Invalid request parameters");
    },
    onSuccess: (_, variables) => {
      showToast(
        variables.id
          ? UI_MESSAGES.lessons.updateSuccess
          : UI_MESSAGES.lessons.createSuccess
      );
      queryClient.invalidateQueries({
        queryKey: ["admin-course-detail", courseId],
      });
    },
    onError: (err) => {
      showToast(
        getApiErrorMessage(err, UI_MESSAGES.lessons.saveFailed),
        "error"
      );
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: deleteAdminLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-course-detail", courseId],
      });
      showToast(UI_MESSAGES.lessons.deleteSuccess);
    },
    onError: (err) => {
      showToast(
        getApiErrorMessage(err, UI_MESSAGES.common.unknownError),
        "error"
      );
    },
  });

  // --- Chapter Operations ---

  const handleSaveChapter = useCallback(async (title: string) => {
    try {
      await saveChapterMutation.mutateAsync({
        id: editingChapter?.id,
        title,
      });
    } finally {
      setEditingChapter(null);
    }
  }, [editingChapter, saveChapterMutation]);

  const handleDeleteChapter = useCallback(async (chapterId: string) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa chương này và tất cả bài học bên trong không?"
      )
    )
      return;

    try {
      await deleteChapterMutation.mutateAsync(chapterId);
    } catch (err) {
      // Handled in mutation onError
    }
  }, [deleteChapterMutation]);

  // --- Lesson Operations ---

  const handleSaveLesson = useCallback(async (data: AdminLessonRequest) => {
    try {
      await saveLessonMutation.mutateAsync({
        id: editingLesson?.lesson.id,
        chapterId: targetChapterIdForLesson || undefined,
        data,
      });
    } finally {
      setEditingLesson(null);
      setTargetChapterIdForLesson(null);
    }
  }, [editingLesson, targetChapterIdForLesson, saveLessonMutation]);

  const handleDeleteLesson = useCallback(async (lessonId: string, chapterId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài học này không?")) return;

    try {
      await deleteLessonMutation.mutateAsync(lessonId);
    } catch (err) {
      // Handled in mutation onError
    }
  }, [deleteLessonMutation]);

  // --- Drag and Drop Reordering ---

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, type: dragType } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    if (dragType === "CHAPTER") {
      const reordered = [...chapters];
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);

      const finalChapters = reordered.map((c, i) => ({
        ...c,
        orderIndex: i + 1,
      }));
      setChapters(finalChapters);

      reorderChaptersMutation.mutate(finalChapters.map((c) => c.id));
    } else if (dragType === "LESSON") {
      const sourceChapterId = source.droppableId;
      const destChapterId = destination.droppableId;

      if (sourceChapterId !== destChapterId) {
        showToast(UI_MESSAGES.lessons.moveAcrossChapterUnsupported, "error");
        return;
      }

      const chapter = chapters.find((c) => c.id === sourceChapterId);
      if (!chapter) return;

      const reorderedLessons = [...chapter.lessons];
      const [removed] = reorderedLessons.splice(source.index, 1);
      reorderedLessons.splice(destination.index, 0, removed);

      const finalLessons = reorderedLessons.map((l, i) => ({
        ...l,
        orderIndex: i + 1,
      }));

      setChapters(
        chapters.map((c) =>
          c.id === sourceChapterId ? { ...c, lessons: finalLessons } : c
        )
      );

      reorderLessonsMutation.mutate({
        chapterId: sourceChapterId,
        lessonIds: finalLessons.map((l) => l.id),
      });
    }
  }, [chapters, reorderChaptersMutation, reorderLessonsMutation, showToast]);

  const handlePublish = useCallback(() => {
    publishMutation.mutate();
  }, [publishMutation]);

  const handleArchive = useCallback(() => {
    archiveMutation.mutate();
  }, [archiveMutation]);

  const handleEditSettings = useCallback(() => {
    showToast(UI_MESSAGES.courses.updateInfoUnavailable, "info");
  }, [showToast]);

  const isAnyMutationPending = useMemo(() => {
    return (
      publishMutation.isPending ||
      archiveMutation.isPending ||
      reorderChaptersMutation.isPending ||
      reorderLessonsMutation.isPending ||
      saveChapterMutation.isPending ||
      deleteChapterMutation.isPending ||
      saveLessonMutation.isPending ||
      deleteLessonMutation.isPending
    );
  }, [
    publishMutation.isPending,
    archiveMutation.isPending,
    reorderChaptersMutation.isPending,
    reorderLessonsMutation.isPending,
    saveChapterMutation.isPending,
    deleteChapterMutation.isPending,
    saveLessonMutation.isPending,
    deleteLessonMutation.isPending,
  ]);

  return {
    courseId,
    chapters,
    courseInfo,
    hasMounted,
    expandedChapters,
    isChapterModalOpen,
    setIsChapterModalOpen,
    editingChapter,
    setEditingChapter,
    isLessonModalOpen,
    setIsLessonModalOpen,
    targetChapterIdForLesson,
    setTargetChapterIdForLesson,
    editingLesson,
    setEditingLesson,
    notification,
    isLoading,
    toggleChapter,
    handleSaveChapter,
    handleDeleteChapter,
    handleSaveLesson,
    handleDeleteLesson,
    handleDragEnd,
    handlePublish,
    handleArchive,
    handleEditSettings,
    isAnyMutationPending,
    publishMutation,
    archiveMutation,
  };
}
