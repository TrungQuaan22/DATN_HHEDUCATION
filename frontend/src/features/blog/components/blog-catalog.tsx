"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
      "text-brand-pink border-brand-pink/20 bg-brand-pink/5",
    "Công nghệ giáo dục":
      "text-accent-orange border-accent-orange/20 bg-accent-orange/5",
    "Hướng nghiệp": "text-sky-blue border-sky-blue/20 bg-sky-blue/5",
    "Phương pháp học": "text-brand-pink border-brand-pink/20 bg-brand-pink/5",
    "Kỹ năng mềm": "text-sky-blue border-sky-blue/20 bg-sky-blue/5",
    "Tin tức": "text-muted-taupe border-border-dark bg-surface-input",
  };
  return (
    classes[category] ||
    "text-brand-pink border-brand-pink/20 bg-brand-pink/5"
  );
};

type BlogCatalogProps = {
  initialPosts?: BlogPostSummary[];
};

export default function BlogCatalog({ initialPosts = [] }: BlogCatalogProps) {
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
  } = useBlogCatalog(initialPosts);

  return (
    <main className="min-h-screen pb-20 pt-24 bg-brand-dark transition-colors duration-200">
      {/* Title & Search Section */}
      <section className="mb-16 text-center max-w-3xl mx-auto px-6">
        <h1 className="text-[36px] md:text-[56px] font-extrabold text-cream mb-6 tracking-tight leading-tight">
          Góc Tri Thức &amp; Cảm Hứng
        </h1>
        <p className="text-[16px] md:text-[18px] text-muted-taupe mb-10 leading-relaxed">
          Khám phá những chia sẻ chuyên sâu về giáo dục, phương pháp học tập
          hiện đại và hành trình phát triển bản thân cùng HH Education.
        </p>

        <div className="relative group max-w-2xl mx-auto flex bg-off-black border border-border-dark rounded overflow-hidden focus-within:border-brand-pink transition-all shadow-sm">
          <div className="pl-4 flex items-center pointer-events-none">
            <Search className="text-muted-taupe w-5 h-5" />
          </div>
          <input
            className="w-full bg-transparent border-none text-[14px] text-cream placeholder-muted-taupe px-4 py-4 outline-none"
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
            className="px-6 py-2 bg-brand-pink text-white text-[13px] font-bold hover:opacity-90 transition-opacity rounded-r-lg cursor-pointer"
            onClick={submitSearch}
            type="button"
          >
            Tìm kiếm
          </button>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="mb-12 flex flex-wrap justify-center gap-3 px-6">
        {categoriesList.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => selectCategory(category)}
              className={`px-6 py-2.5 rounded-full text-[13px] font-semibold cursor-pointer transition-all duration-200 border ${
                isActive
                  ? "bg-brand-pink text-white border-brand-pink shadow-md"
                  : "bg-deep-black border-border-dark text-muted-taupe hover:border-brand-pink hover:text-brand-pink"
              }`}
              type="button"
            >
              {category}
            </button>
          );
        })}
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
              className="md:col-span-8 group relative overflow-hidden rounded border border-border-dark cursor-pointer bg-deep-black shadow-2xl flex flex-col justify-end min-h-[450px]"
            >
              <div className="absolute inset-0 w-full h-full">
                <Image
                  alt={featuredLarge.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="object-cover transition-all duration-300"
                  src={
                    featuredLarge.thumbnailUrl ||
                    "https://via.placeholder.com/600x400"
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/50 to-transparent z-10" />
              </div>

              <div className="relative z-20 p-8 text-cream w-full space-y-4">
                <span className="inline-block px-3 py-1 bg-brand-pink text-white text-[10px] font-bold rounded uppercase tracking-wider">
                  Tiêu điểm
                </span>
                <Link href={`/blog/${featuredLarge.slug}`}>
                  <h2 className="text-[24px] md:text-[32px] font-bold leading-tight group-hover:text-brand-pink transition-colors">
                    {featuredLarge.title}
                  </h2>
                </Link>
                <p className="text-muted-taupe text-[14px] leading-relaxed max-w-2xl line-clamp-2">
                  {featuredLarge.excerpt}
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="relative w-10 h-10 rounded-full border-2 border-brand-pink/30 overflow-hidden bg-brand-dark flex-shrink-0">
                    <Image
                      alt={featuredLarge.author.fullName}
                      fill
                      sizes="40px"
                      className="object-cover"
                      src={
                        featuredLarge.author.avatarUrl ||
                        "https://via.placeholder.com/40"
                      }
                    />
                  </div>
                  <div className="text-[12px]">
                    <p className="font-bold text-cream">
                      {featuredLarge.author.fullName}
                    </p>
                    <p className="text-muted-taupe">
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
        <h2 className="text-[20px] md:text-[24px] font-bold text-cream mb-8 flex items-center gap-3">
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
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-[13px] cursor-pointer transition-all ${
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
                className="bg-brand-pink text-white px-6 py-2.5 rounded-lg text-[13px] font-bold cursor-pointer hover:opacity-90 active:scale-95 transition-all"
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
