import { api } from '@/lib/api/axios';
import { Subject } from '@/types/common';

export type CourseStatus = 'draft' | 'published' | 'archived';

export type AdminCourseTeacher = {
  id: string;
  email: string;
  fullName: string;
  avatarMediaId: string | null;
  avatarUrl: string | null;
};

export type AdminCourseResponseData = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  subject: Subject;
  grade: number;
  teacherId: string;
  teacher: AdminCourseTeacher;
  thumbnailMediaId: string | null;
  thumbnailUrl: string | null;
  price: number;
  salePrice: number | null;
  status: CourseStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListAdminCoursesParams = {
  page?: number;
  limit?: number;
  status?: CourseStatus;
  teacherId?: string;
  isFeatured?: boolean;
  search?: string;
};

export type ListAdminCoursesResponse = {
  items: AdminCourseResponseData[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

export type CreateCourseRequest = {
  title: string;
  description?: string;
  subject: Subject;
  grade: number;
  teacherId: string;
  thumbnailMediaId?: string | null;
  price: number;
  salePrice?: number | null;
  isFeatured?: boolean;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export const getAdminCourses = async (
  params: ListAdminCoursesParams
): Promise<ListAdminCoursesResponse> => {
  const response = await api.get<ApiEnvelope<ListAdminCoursesResponse>>('/admin/courses', {
    params,
  });
  return response.data.data;
};

export const createAdminCourse = async (
  data: CreateCourseRequest
): Promise<AdminCourseResponseData> => {
  const response = await api.post<ApiEnvelope<AdminCourseResponseData>>('/admin/courses', data);
  return response.data.data;
};

export const updateAdminCourse = async (
  courseId: string,
  data: Partial<CreateCourseRequest>
): Promise<AdminCourseResponseData> => {
  const response = await api.patch<ApiEnvelope<AdminCourseResponseData>>(`/admin/courses/${courseId}`, data);
  return response.data.data;
};

export const publishAdminCourse = async (
  courseId: string
): Promise<AdminCourseResponseData> => {
  const response = await api.patch<ApiEnvelope<AdminCourseResponseData>>(`/admin/courses/${courseId}/publish`);
  return response.data.data;
};

export const archiveAdminCourse = async (
  courseId: string
): Promise<AdminCourseResponseData> => {
  const response = await api.patch<ApiEnvelope<AdminCourseResponseData>>(`/admin/courses/${courseId}/archive`);
  return response.data.data;
};

// --- Curriculum Builder Additions ---

export type AdminLessonRequest = {
  title: string;
  type: 'video' | 'quiz' | 'document';
  description?: string | null;
  videoType?: 'system' | 'youtube' | null;
  videoMediaId?: string | null;
  youtubeUrl?: string | null;
  durationSec?: number | null;
  allowPreview?: boolean;
  assessmentId?: string | null;
};

export type AdminLessonResponse = {
  id: string;
  chapterId: string;
  title: string;
  type: 'video' | 'quiz' | 'document';
  description: string | null;
  videoType: 'system' | 'youtube' | null;
  videoMediaId: string | null;
  youtubeUrl: string | null;
  durationSec: number | null;
  allowPreview: boolean;
  orderIndex: number;
  lessonAssessments?: { assessmentId: string }[];
  videoMedia?: { id: string, objectKey: string } | null;
};

export type AdminChapterResponse = {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lessons: AdminLessonResponse[];
};

export type AdminCourseDetailResponse = AdminCourseResponseData & {
  chapters: AdminChapterResponse[];
};

export const getAdminCourse = async (
  courseId: string
): Promise<AdminCourseDetailResponse> => {
  const response = await api.get<ApiEnvelope<AdminCourseDetailResponse>>(`/admin/courses/${courseId}`);
  return response.data.data;
};

// Chapters API
export const createAdminChapter = async (
  courseId: string,
  title: string
): Promise<AdminChapterResponse> => {
  const response = await api.post<ApiEnvelope<AdminChapterResponse>>(`/admin/courses/${courseId}/chapters`, { title });
  return response.data.data;
};

export const updateAdminChapter = async (
  chapterId: string,
  title: string
): Promise<AdminChapterResponse> => {
  const response = await api.patch<ApiEnvelope<AdminChapterResponse>>(`/admin/chapters/${chapterId}`, { title });
  return response.data.data;
};

export const deleteAdminChapter = async (
  chapterId: string
): Promise<void> => {
  await api.delete(`/admin/chapters/${chapterId}`);
};

export const reorderAdminChapters = async (
  courseId: string,
  chapterIds: string[]
): Promise<void> => {
  await api.patch(`/admin/courses/${courseId}/chapters/reorder`, { chapterIds });
};

// Lessons API
export const createAdminLesson = async (
  chapterId: string,
  data: AdminLessonRequest
): Promise<AdminLessonResponse> => {
  const response = await api.post<ApiEnvelope<AdminLessonResponse>>(`/admin/chapters/${chapterId}/lessons`, data);
  return response.data.data;
};

export const updateAdminLesson = async (
  lessonId: string,
  data: Partial<AdminLessonRequest>
): Promise<AdminLessonResponse> => {
  const response = await api.patch<ApiEnvelope<AdminLessonResponse>>(`/admin/lessons/${lessonId}`, data);
  return response.data.data;
};

export const deleteAdminLesson = async (
  lessonId: string
): Promise<void> => {
  await api.delete(`/admin/lessons/${lessonId}`);
};

export const reorderAdminLessons = async (
  chapterId: string,
  lessonIds: string[]
): Promise<void> => {
  await api.patch(`/admin/chapters/${chapterId}/lessons/reorder`, { lessonIds });
};
