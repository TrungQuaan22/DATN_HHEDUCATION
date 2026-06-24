import { api } from "@/lib/api/axios";
import type {
  AdminBlogPost,
  AdminBlogPostListResponse,
  BlogCategory,
  BlogCategoryListResponse,
  SaveBlogPostInput,
} from "./types";

type ApiEnvelope<T> = { success: boolean; data: T };

export async function listAdminBlogPosts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "draft" | "published";
  categorySlug?: string;
}): Promise<AdminBlogPostListResponse> {
  const response = await api.get<ApiEnvelope<AdminBlogPostListResponse>>("/admin/blog-posts", {
    params,
  });
  return response.data.data;
}

export async function getAdminBlogPost(id: string): Promise<AdminBlogPost> {
  const response = await api.get<ApiEnvelope<AdminBlogPost>>(`/admin/blog-posts/${id}`);
  return response.data.data;
}

export async function createBlogPost(input: SaveBlogPostInput): Promise<AdminBlogPost> {
  const response = await api.post<ApiEnvelope<AdminBlogPost>>("/admin/blog-posts", input);
  return response.data.data;
}

export async function updateBlogPost(id: string, input: SaveBlogPostInput): Promise<AdminBlogPost> {
  const response = await api.patch<ApiEnvelope<AdminBlogPost>>(`/admin/blog-posts/${id}`, input);
  return response.data.data;
}

export async function publishBlogPost(id: string): Promise<AdminBlogPost> {
  const response = await api.patch<ApiEnvelope<AdminBlogPost>>(`/admin/blog-posts/${id}/publish`);
  return response.data.data;
}

export async function unpublishBlogPost(id: string): Promise<AdminBlogPost> {
  const response = await api.patch<ApiEnvelope<AdminBlogPost>>(`/admin/blog-posts/${id}/unpublish`);
  return response.data.data;
}

export async function deleteBlogPost(id: string): Promise<void> {
  await api.delete(`/admin/blog-posts/${id}`);
}

export async function listAdminBlogCategories(): Promise<BlogCategoryListResponse> {
  const response = await api.get<ApiEnvelope<BlogCategoryListResponse>>(
    "/admin/blog-posts/categories",
    { params: { limit: 100 } },
  );
  return response.data.data;
}

export async function createBlogCategory(input: { name: string; slug?: string }): Promise<BlogCategory> {
  const response = await api.post<ApiEnvelope<BlogCategory>>(
    "/admin/blog-posts/categories",
    input,
  );
  return response.data.data;
}
