import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTeacherOptions,
  getMyLearningCourses,
  getCatalogCourses,
  getLearningCourseOverview,
  getLearningLesson,
  updateLessonProgress,
} from './api';
import { ListTeacherOptionsParams, ListCatalogCoursesParams } from './types';

export function useTeacherOptionsQuery(params?: ListTeacherOptionsParams) {
  return useQuery({
    queryKey: ['admin-teachers-options', params],
    queryFn: async () => {
      const data = await getTeacherOptions(params);
      return data.items;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyLearningCoursesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['my-learning-courses'],
    queryFn: () => getMyLearningCourses(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useCatalogCoursesQuery(params?: ListCatalogCoursesParams) {
  return useQuery({
    queryKey: ['catalog-courses', params],
    queryFn: () => getCatalogCourses(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLearningCourseOverviewQuery(courseSlug: string) {
  return useQuery({
    queryKey: ['learning-course-overview', courseSlug],
    queryFn: () => getLearningCourseOverview(courseSlug),
    enabled: !!courseSlug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLearningLessonDetailQuery(lessonId?: string | null) {
  return useQuery({
    queryKey: ['learning-lesson-detail', lessonId],
    queryFn: () => getLearningLesson(lessonId as string),
    enabled: !!lessonId,
    staleTime: 5 * 60 * 1000,
  });
}

type UseUpdateProgressMutationOptions = {
  invalidateOnSuccess?: boolean;
};

export function useUpdateProgressMutation(options: UseUpdateProgressMutationOptions = {}) {
  const queryClient = useQueryClient();
  const { invalidateOnSuccess = true } = options;

  return useMutation({
    mutationKey: ['lesson-progress-autosave'],
    mutationFn: ({
      lessonId,
      watchedSeconds,
      lastPositionSec,
    }: {
      lessonId: string;
      watchedSeconds: number;
      lastPositionSec: number;
    }) => updateLessonProgress(lessonId, { watchedSeconds, lastPositionSec }),
    onSuccess: () => {
      if (!invalidateOnSuccess) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['learning-course-overview'] });
      queryClient.invalidateQueries({ queryKey: ['learning-lesson-detail'] });
      queryClient.invalidateQueries({ queryKey: ['my-learning-courses'] });
    },
  });
}
