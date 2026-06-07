import type { PaginatedResponseShape, RichContent } from '@/types/common';

export type BlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category?: string | null;
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
  category?: string;
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
  name: string;
  count: number;
};

export type BlogCategoryListResponse = {
  items: BlogCategorySummary[];
};
