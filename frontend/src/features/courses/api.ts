import { api } from "@/lib/api/axios";
import {
  AdminCourseSummary,
  AdminCourseChapter,
  AdminCourseLesson,
  AdminLessonRequest,
  AdminCourseDetail,
  CatalogCourseDetailResponse,
  ListAdminCoursesParams,
  ListAdminCoursesResponse,
  CreateCourseRequest,
  ListTeacherOptionsParams,
  ListTeacherOptionsResponse,
  ListCatalogCoursesParams,
  ListCatalogCoursesResponse,
  LearningCourseItem,
  LearningCourseOverview,
  LearningLessonDetail,
  UpdateProgressResponse,
  AdminLessonMaterial,
  AdminLessonMaterialRequest,
} from "./types";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export const getAdminCourses = async (
  params: ListAdminCoursesParams,
): Promise<ListAdminCoursesResponse> => {
  const response = await api.get<ApiEnvelope<ListAdminCoursesResponse>>(
    "/admin/courses",
    {
      params,
    },
  );
  return response.data.data;
};

export const createAdminCourse = async (
  data: CreateCourseRequest,
): Promise<AdminCourseSummary> => {
  const response = await api.post<ApiEnvelope<AdminCourseSummary>>(
    "/admin/courses",
    data,
  );
  return response.data.data;
};

export const updateAdminCourse = async (
  courseId: string,
  data: Partial<CreateCourseRequest>,
): Promise<AdminCourseSummary> => {
  const response = await api.patch<ApiEnvelope<AdminCourseSummary>>(
    `/admin/courses/${courseId}`,
    data,
  );
  return response.data.data;
};

export const publishAdminCourse = async (
  courseId: string,
): Promise<AdminCourseSummary> => {
  const response = await api.patch<ApiEnvelope<AdminCourseSummary>>(
    `/admin/courses/${courseId}/publish`,
  );
  return response.data.data;
};

export const archiveAdminCourse = async (
  courseId: string,
): Promise<AdminCourseSummary> => {
  const response = await api.patch<ApiEnvelope<AdminCourseSummary>>(
    `/admin/courses/${courseId}/archive`,
  );
  return response.data.data;
};

export const getAdminCourse = async (
  courseId: string,
): Promise<AdminCourseDetail> => {
  const response = await api.get<ApiEnvelope<AdminCourseDetail>>(
    `/admin/courses/${courseId}`,
  );
  return response.data.data;
};

// Chapters API
export const createAdminChapter = async (
  courseId: string,
  title: string,
): Promise<AdminCourseChapter> => {
  const response = await api.post<ApiEnvelope<AdminCourseChapter>>(
    `/admin/courses/${courseId}/chapters`,
    { title },
  );
  return response.data.data;
};

export const updateAdminChapter = async (
  chapterId: string,
  title: string,
): Promise<AdminCourseChapter> => {
  const response = await api.patch<ApiEnvelope<AdminCourseChapter>>(
    `/admin/chapters/${chapterId}`,
    { title },
  );
  return response.data.data;
};

export const deleteAdminChapter = async (chapterId: string): Promise<void> => {
  await api.delete(`/admin/chapters/${chapterId}`);
};

export const reorderAdminChapters = async (
  courseId: string,
  chapterIds: string[],
): Promise<void> => {
  await api.patch(`/admin/courses/${courseId}/chapters/reorder`, {
    chapterIds,
  });
};

// Lessons API
export const createAdminLesson = async (
  chapterId: string,
  data: AdminLessonRequest,
): Promise<AdminCourseLesson> => {
  const response = await api.post<ApiEnvelope<AdminCourseLesson>>(
    `/admin/chapters/${chapterId}/lessons`,
    data,
  );
  return response.data.data;
};

export const updateAdminLesson = async (
  lessonId: string,
  data: Partial<AdminLessonRequest>,
): Promise<AdminCourseLesson> => {
  const response = await api.patch<ApiEnvelope<AdminCourseLesson>>(
    `/admin/lessons/${lessonId}`,
    data,
  );
  return response.data.data;
};

export const deleteAdminLesson = async (lessonId: string): Promise<void> => {
  await api.delete(`/admin/lessons/${lessonId}`);
};

export const reorderAdminLessons = async (
  chapterId: string,
  lessonIds: string[],
): Promise<void> => {
  await api.patch(`/admin/chapters/${chapterId}/lessons/reorder`, {
    lessonIds,
  });
};

export const getCatalogCourse = async (
  courseSlug: string,
): Promise<CatalogCourseDetailResponse> => {
  const response = await api.get<ApiEnvelope<CatalogCourseDetailResponse>>(
    `/catalog/courses/${courseSlug}`,
  );
  return response.data.data;
};

export const getCatalogCourses = async (
  params?: ListCatalogCoursesParams,
): Promise<ListCatalogCoursesResponse> => {
  const response = await api.get<ApiEnvelope<ListCatalogCoursesResponse>>(
    "/catalog/courses",
    {
      params,
    },
  );
  return response.data.data;
};

export const getTeacherOptions = async (
  params?: ListTeacherOptionsParams,
): Promise<ListTeacherOptionsResponse> => {
  const response = await api.get<ApiEnvelope<ListTeacherOptionsResponse>>(
    "/admin/teachers/options",
    {
      params,
    },
  );
  return response.data.data;
};

export const getMyLearningCourses = async (): Promise<LearningCourseItem[]> => {
  const response = await api.get<ApiEnvelope<{ items: LearningCourseItem[] }>>(
    "/learning/courses",
  );
  return response.data.data.items;
};

export const getLearningCourseOverview = async (
  courseSlug: string,
): Promise<LearningCourseOverview> => {
  const response = await api.get<ApiEnvelope<LearningCourseOverview>>(
    `/learning/courses/${courseSlug}`,
  );
  return response.data.data;
};

export const getLearningLesson = async (
  lessonId: string,
): Promise<LearningLessonDetail> => {
  const response = await api.get<ApiEnvelope<LearningLessonDetail>>(
    `/learning/lessons/${lessonId}`,
  );
  return response.data.data;
};

export const updateLessonProgress = async (
  lessonId: string,
  data: { watchedSeconds: number; lastPositionSec: number },
): Promise<UpdateProgressResponse> => {
  const response = await api.post<ApiEnvelope<UpdateProgressResponse>>(
    `/learning/lessons/${lessonId}/progress`,
    data,
  );
  return response.data.data;
};

// Admin Lesson Materials API
export const getAdminLessonMaterials = async (
  lessonId: string
): Promise<AdminLessonMaterial[]> => {
  const response = await api.get<ApiEnvelope<AdminLessonMaterial[]>>(
    `/admin/lessons/${lessonId}/materials`
  );
  return response.data.data;
};

export const createAdminLessonMaterial = async (
  lessonId: string,
  data: AdminLessonMaterialRequest
): Promise<AdminLessonMaterial> => {
  const response = await api.post<ApiEnvelope<AdminLessonMaterial>>(
    `/admin/lessons/${lessonId}/materials`,
    data
  );
  return response.data.data;
};

export const updateAdminLessonMaterial = async (
  materialId: string,
  data: Partial<AdminLessonMaterialRequest>
): Promise<AdminLessonMaterial> => {
  const response = await api.patch<ApiEnvelope<AdminLessonMaterial>>(
    `/admin/lesson-materials/${materialId}`,
    data
  );
  return response.data.data;
};

export const deleteAdminLessonMaterial = async (
  materialId: string
): Promise<{ id: string; deleted: boolean }> => {
  const response = await api.delete<ApiEnvelope<{ id: string; deleted: boolean }>>(
    `/admin/lesson-materials/${materialId}`
  );
  return response.data.data;
};

export const ingestAdminLessonMaterial = async (
  materialId: string
): Promise<{ id: string; processingStatus: string; triggered: boolean }> => {
  const response = await api.post<ApiEnvelope<{ id: string; processingStatus: string; triggered: boolean }>>(
    `/admin/lesson-materials/${materialId}/ingest`
  );
  return response.data.data;
};
