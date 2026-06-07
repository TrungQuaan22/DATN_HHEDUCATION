import { api } from '@/lib/api/axios';
import {
  BlogPostListParams,
  BlogPostListResponse,
  BlogTagListResponse,
  BlogCategoryListResponse,
  BlogPostDetail,
} from './types';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export const getBlogPosts = async (
  params: BlogPostListParams
): Promise<BlogPostListResponse> => {
  const response = await api.get<ApiEnvelope<BlogPostListResponse>>('/blog-posts', {
    params,
  });

  return response.data.data;
};

export const getBlogTags = async (limit = 5): Promise<BlogTagListResponse> => {
  const response = await api.get<ApiEnvelope<BlogTagListResponse>>('/blog-posts/tags', {
    params: { limit },
  });

  return response.data.data;
};

export const getBlogCategories = async (limit = 5): Promise<BlogCategoryListResponse> => {
  const response = await api.get<ApiEnvelope<BlogCategoryListResponse>>(
    '/blog-posts/categories',
    {
      params: { limit },
    }
  );

  return response.data.data;
};

export const getBlogPostDetail = async (slug: string): Promise<BlogPostDetail> => {
  const response = await api.get<ApiEnvelope<BlogPostDetail>>(`/blog-posts/${slug}`);
  return response.data.data;
};
