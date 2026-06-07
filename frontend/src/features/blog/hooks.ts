"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBlogCategories, getBlogPosts, getBlogPostDetail } from "./api";
import { BlogPostSummary } from "./types";
import { prefetchedBlogPostSlugs } from "./prefetch";
import {
  isQueryFresh,
  PREFETCH_STALE_TIME_MS,
  useIntentPrefetch,
} from "@/lib/utils/prefetch";

const ALL_CATEGORIES_LABEL = "Tất cả";
const POSTS_PER_PAGE = 6;

const fallbackCategories = [
  "Phương pháp học",
  "Hướng nghiệp",
  "Công nghệ giáo dục",
  "Kỹ năng mềm",
  "Tin tức",
];

export function useBlogCatalog(initialPosts: BlogPostSummary[] = []) {
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
        category: selectedCategoryParam,
      },
    ],
    queryFn: () =>
      getBlogPosts({
        page: currentPage,
        limit: POSTS_PER_PAGE,
        search: searchQuery.trim() || undefined,
        category: selectedCategoryParam,
      }),
    placeholderData: (previousData) => previousData,
  });

  const featuredQuery = useQuery({
    queryKey: ["blog-posts", "featured", 3],
    queryFn: () => getBlogPosts({ page: 1, limit: 3, featured: true }),
    staleTime: 10 * 60 * 1000,
  });

  const categoriesQuery = useQuery({
    queryKey: ["blog-post-categories", 5],
    queryFn: () => getBlogCategories(5),
    staleTime: 10 * 60 * 1000,
  });

  const categoriesList = useMemo(() => {
    return [
      ALL_CATEGORIES_LABEL,
      ...((categoriesQuery.data?.items?.length
        ? categoriesQuery.data.items.map(
            (category: { name: string }) => category.name
          )
        : null) ?? fallbackCategories),
    ];
  }, [categoriesQuery.data]);

  const filteredMockPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === ALL_CATEGORIES_LABEL ||
        post.category === selectedCategory;
      const normalizedSearch = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(normalizedSearch) ||
        post.excerpt.toLowerCase().includes(normalizedSearch) ||
        post.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

      return matchesCategory && matchesSearch;
    });
  }, [initialPosts, searchQuery, selectedCategory]);

  const posts = useMemo(() => {
    return postsQuery.data?.items?.length
      ? postsQuery.data.items
      : filteredMockPosts.slice(
          (currentPage - 1) * POSTS_PER_PAGE,
          currentPage * POSTS_PER_PAGE
        );
  }, [postsQuery.data, filteredMockPosts, currentPage]);

  const totalPages = useMemo(() => {
    return postsQuery.data?.items?.length
      ? (postsQuery.data?.pagination.totalPages ?? 1)
      : Math.ceil(filteredMockPosts.length / POSTS_PER_PAGE) || 1;
  }, [postsQuery.data, filteredMockPosts]);

  const featuredPosts = useMemo(() => {
    return featuredQuery.data?.items?.length
      ? featuredQuery.data.items
      : initialPosts.slice(0, 3);
  }, [featuredQuery.data, initialPosts]);

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
