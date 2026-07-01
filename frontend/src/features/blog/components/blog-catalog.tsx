"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
} from "lucide-react";

import type { BlogPostSummary } from "../types";
import { useBlogCatalog } from "../hooks";
import { FeaturedSideCard } from "./featured-side-card";
import { BlogPostCard } from "./blog-post-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SafeImage } from "@/components/media/safe-image";

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const getCategoryColorClass = (category: string) => {
  const classes: Record<string, string> = {
    "Bí kíp luyện thi":
      "text-white bg-brand-pink border-transparent",
    "Công nghệ giáo dục":
      "text-white bg-accent-orange border-transparent",
    "Hướng nghiệp": "text-white bg-sky-blue border-transparent",
    "Phương pháp học": "text-white bg-brand-pink border-transparent",
    "Kỹ năng mềm": "text-white bg-sky-blue border-transparent",
    "Tin tức": "text-white bg-neutral-600 border-transparent",
  };
  return (
    classes[category] ||
    "text-white bg-brand-pink border-transparent"
  );
};

export default function BlogCatalog() {
  const {
    searchInput,
    setSearchInput,
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
    handleLargeMouseEnter,
    handleLargeMouseLeave,
    handleLargeFocus,
    handleLargeTouchStart,
    selectCategory,
    changePage,
  } = useBlogCatalog();

  return (
    <main className="min-h-screen pb-20 pt-24 bg-brand-dark transition-colors duration-200">
      {/* Title & Search Section */}
      <section className="mb-16 text-center max-w-3xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-cream mb-6 tracking-tight leading-tight">
          Góc Tri Thức &amp; Cảm Hứng
        </h1>
        <p className="text-base md:text-lg text-muted-taupe mb-10 leading-relaxed">
          Khám phá những chia sẻ chuyên sâu về giáo dục, phương pháp học tập
          hiện đại và hành trình phát triển bản thân cùng HH Education.
        </p>

        <div className="relative group max-w-2xl mx-auto flex bg-off-black border border-border-dark rounded overflow-hidden focus-within:border-brand-pink transition-all shadow-sm">
          <div className="pl-4 flex items-center pointer-events-none">
            <Search className="text-muted-taupe w-5 h-5" />
          </div>
          <input
            className="w-full bg-transparent border-none text-sm text-cream placeholder-muted-taupe px-4 py-4 outline-none"
            placeholder="Tìm kiếm bài viết..."
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submitSearch();
              }
            }}
          />
          <button
            className="px-6 py-2 bg-brand-pink text-white text-sm font-bold hover:opacity-90 transition-opacity rounded-r-lg cursor-pointer"
            onClick={submitSearch}
            type="button"
          >
            Tìm kiếm
          </button>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="mb-12 w-full px-6 max-w-[1200px] mx-auto">
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar justify-start md:justify-center gap-3 py-2 scroll-smooth">
          {categoriesList.map((category) => {
            const isActive = selectedCategory === category.slug;
            return (
              <button
                key={category.slug}
                onClick={() => selectCategory(category.slug)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 border shrink-0 ${
                  isActive
                    ? "bg-brand-pink text-white border-brand-pink shadow-md"
                    : "bg-deep-black border-border-dark text-muted-taupe hover:border-brand-pink hover:text-brand-pink"
                }`}
                type="button"
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Featured Section */}
        {!isFiltering && featuredLarge && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-20">
            <article
              onMouseEnter={handleLargeMouseEnter}
              onMouseLeave={handleLargeMouseLeave}
              onFocus={handleLargeFocus}
              onTouchStart={handleLargeTouchStart}
              className="md:col-span-8 group relative overflow-hidden rounded border border-neutral-800 cursor-pointer bg-neutral-900 shadow-2xl flex flex-col justify-end min-h-[450px]"
            >
              <div className="absolute inset-0 w-full h-full">
                <SafeImage
                  alt={featuredLarge.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="object-cover transition-all duration-300"
                  src={featuredLarge.thumbnailUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />
              </div>

              <div className="relative z-20 p-8 text-white w-full space-y-4">
                <span className="inline-block px-3 py-1 bg-brand-pink text-white text-xs font-bold rounded uppercase tracking-wider">
                  Tiêu điểm
                </span>
                <Link href={`/blog/${featuredLarge.slug}`}>
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-brand-pink transition-colors text-white">
                    {featuredLarge.title}
                  </h2>
                </Link>
                <p className="text-neutral-300 text-sm leading-relaxed max-w-2xl line-clamp-2">
                  {featuredLarge.excerpt}
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="relative w-10 h-10 rounded-full border-2 border-brand-pink/30 overflow-hidden bg-brand-dark flex-shrink-0">
                    <SafeImage
                      alt={featuredLarge.author.fullName}
                      fill
                      sizes="40px"
                      className="object-cover"
                      src={featuredLarge.author.avatarUrl}
                    />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-white">
                      {featuredLarge.author.fullName}
                    </p>
                    <p className="text-neutral-400">
                      {formatDate(featuredLarge.publishedAt)} •{" "}
                      {featuredLarge.readingMinutes} phút đọc
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <div className="md:col-span-4 flex flex-col gap-6">
              {featuredSides.map((post: BlogPostSummary) => (
                <FeaturedSideCard
                  key={post.id}
                  post={post}
                />
              ))}
            </div>
          </section>
        )}

        {/* Latest Posts Header */}
        <h2 className="text-xl md:text-2xl font-bold text-cream mb-8 flex items-center gap-3">
          <span className="w-8 h-1 bg-brand-pink rounded-full" />
          {isFiltering ? "Kết quả tìm kiếm" : "Bài viết mới nhất"}
          {postsQuery.isFetching && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-taupe" />
          )}
        </h2>

        {postsQuery.isError && posts.length === 0 ? (
          <EmptyState
            title="Không tải được bài viết"
            description="Có lỗi xảy ra trong quá trình tải dữ liệu từ máy chủ. Vui lòng thử lại sau ít phút."
            className="py-16"
          />
        ) : posts.length > 0 ? (
          <>
            {/* Grid list */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post: BlogPostSummary) => (
                <BlogPostCard
                  key={post.id}
                  post={post}
                  formatDate={formatDate}
                  getCategoryColorClass={getCategoryColorClass}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => changePage(Math.max(1, currentPage - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-dark text-cream hover:bg-deep-black disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                  type="button"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => changePage(index + 1)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm cursor-pointer transition-all ${
                      currentPage === index + 1
                        ? "bg-brand-pink text-white"
                        : "border border-border-dark text-cream hover:bg-deep-black"
                    }`}
                    type="button"
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-dark text-cream hover:bg-deep-black disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                  type="button"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="Không tìm thấy bài viết"
            description="Không có bài viết nào phù hợp với yêu cầu tìm kiếm của bạn. Vui lòng thử lại với từ khóa khác."
            action={
              <button
                onClick={resetFilters}
                className="bg-brand-pink text-white px-6 py-2.5 rounded-lg text-sm font-bold cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                type="button"
              >
                Đặt lại bộ lọc
              </button>
            }
            className="py-16"
          />
        )}
      </div>
    </main>
  );
}
