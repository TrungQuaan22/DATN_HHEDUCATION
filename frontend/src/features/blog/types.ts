import type { PaginatedResponseShape, RichContent } from '@/types/common';

export type BlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: BlogCategory | null;
  thumbnailMediaId?: string | null;
  thumbnailUrl: string | null;
  author: {
    id: string;
    fullName: string;
    avatarMediaId?: string | null;
    avatarUrl?: string | null;
  };
  publishedAt: string;
  readingMinutes: number;
  tags: string[];
  isFeatured?: boolean;
};

export type BlogPostDetail = BlogPostSummary & {
  content: RichContent;
  relatedPosts: BlogPostSummary[];
};

export type BlogPostListParams = {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
  categorySlug?: string;
  featured?: boolean;
};

export type BlogPostListResponse = PaginatedResponseShape<BlogPostSummary>;

export type BlogTagSummary = {
  name: string;
  count: number;
};

export type BlogTagListResponse = {
  items: BlogTagSummary[];
};

export type BlogCategorySummary = {
  id: string;
  name: string;
  slug: string;
  count: number;
};

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
};

export type AdminBlogPost = BlogPostDetail & {
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
};

export type AdminBlogPostSummary = BlogPostSummary & {
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
};

export type AdminBlogPostListResponse = PaginatedResponseShape<AdminBlogPostSummary>;

export type SaveBlogPostInput = {
  title: string;
  slug?: string;
  excerpt?: string | null;
  categoryId?: string | null;
  tags: string[];
  content: RichContent;
  thumbnailMediaId?: string | null;
  isFeatured?: boolean;
};

export type BlogCategoryListResponse = {
  items: BlogCategorySummary[];
};
