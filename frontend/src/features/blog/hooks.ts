"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBlogCategories, getBlogPosts, getBlogPostDetail } from "./api";
import { prefetchedBlogPostSlugs } from "./prefetch";
import {
  isQueryFresh,
  PREFETCH_STALE_TIME_MS,
  useIntentPrefetch,
} from "@/lib/utils/prefetch";

const ALL_CATEGORIES_LABEL = "Tất cả";
const POSTS_PER_PAGE = 6;

export function useBlogCatalog() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>(ALL_CATEGORIES_LABEL);
  const [currentPage, setCurrentPage] = useState(1);

  const selectedCategoryParam = useMemo(() => {
    return selectedCategory === ALL_CATEGORIES_LABEL ? undefined : selectedCategory;
  }, [selectedCategory]);

  const isFiltering = useMemo(() => {
    return searchQuery.trim() !== "" || selectedCategoryParam !== undefined;
  }, [searchQuery, selectedCategoryParam]);

  const postsQuery = useQuery({
    queryKey: [
      "blog-posts",
      {
        page: currentPage,
        search: searchQuery,
        categorySlug: selectedCategoryParam,
      },
    ],
    queryFn: () =>
      getBlogPosts({
        page: currentPage,
        limit: POSTS_PER_PAGE,
        search: searchQuery.trim() || undefined,
        categorySlug: selectedCategoryParam,
      }),
    placeholderData: (previousData) => previousData,
  });

  const featuredQuery = useQuery({
    queryKey: ["blog-posts", "featured", 3],
    queryFn: () => getBlogPosts({ page: 1, limit: 3, featured: true }),
    staleTime: 10 * 60 * 1000,
  });

  const categoriesQuery = useQuery({
    queryKey: ["blog-post-categories", 10],
    queryFn: () => getBlogCategories(10),
    staleTime: 10 * 60 * 1000,
  });

  const categoriesList = useMemo(() => {
    return [
      { name: ALL_CATEGORIES_LABEL, slug: ALL_CATEGORIES_LABEL },
      ...(categoriesQuery.data?.items ?? []),
    ];
  }, [categoriesQuery.data]);

  const posts = postsQuery.data?.items ?? [];
  const totalPages = postsQuery.data?.pagination.totalPages ?? 1;
  const featuredPosts = useMemo(() => featuredQuery.data?.items ?? [], [featuredQuery.data]);

  const featuredLarge = useMemo(() => featuredPosts[0], [featuredPosts]);
  const featuredSides = useMemo(() => featuredPosts.slice(1, 3), [featuredPosts]);

  const submitSearch = useCallback(() => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  }, [searchInput]);

  const resetFilters = useCallback(() => {
    setSelectedCategory(ALL_CATEGORIES_LABEL);
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  const prefetchFeaturedLarge = useCallback(async () => {
    if (!featuredLarge) return;

    const postHref = `/blog/${featuredLarge.slug}`;
    const queryKey = ["blog-post", featuredLarge.slug] as const;
    router.prefetch(postHref);

    if (!isQueryFresh(queryClient, queryKey, PREFETCH_STALE_TIME_MS)) {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: () => getBlogPostDetail(featuredLarge.slug),
        staleTime: PREFETCH_STALE_TIME_MS,
      });
    }
  }, [featuredLarge, queryClient, router]);

  const featuredLargePrefetchHandlers = useIntentPrefetch({
    id: featuredLarge?.slug ?? "",
    prefetchedIds: prefetchedBlogPostSlugs,
    prefetch: prefetchFeaturedLarge,
  });

  const selectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    searchInput,
    setSearchInput,
    searchQuery,
    selectedCategory,
    currentPage,
    isFiltering,
    postsQuery,
    categoriesList,
    posts,
    totalPages,
    featuredLarge,
    featuredSides,
    submitSearch,
    resetFilters,
    handleLargeMouseEnter: featuredLargePrefetchHandlers.onMouseEnter,
    handleLargeMouseLeave: featuredLargePrefetchHandlers.onMouseLeave,
    handleLargeFocus: featuredLargePrefetchHandlers.onFocus,
    handleLargeTouchStart: featuredLargePrefetchHandlers.onTouchStart,
    selectCategory,
    changePage,
  };
}
