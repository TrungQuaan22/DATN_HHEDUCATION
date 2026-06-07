"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { BlogPostSummary } from "../types";
import { getBlogPostDetail } from "../api";
import { prefetchedBlogPostSlugs } from "../prefetch";
import {
  isQueryFresh,
  PREFETCH_STALE_TIME_MS,
  useIntentPrefetch,
} from "@/lib/utils/prefetch";

interface BlogPostCardProps {
  post: BlogPostSummary;
  formatDate: (dateStr: string) => string;
  getCategoryColorClass: (category: string) => string;
}

export function BlogPostCard({
  post,
  formatDate,
  getCategoryColorClass,
}: BlogPostCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const postHref = `/blog/${post.slug}`;

  const prefetchPost = useCallback(async () => {
    const queryKey = ["blog-post", post.slug] as const;
    router.prefetch(postHref);

    if (!isQueryFresh(queryClient, queryKey, PREFETCH_STALE_TIME_MS)) {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: () => getBlogPostDetail(post.slug),
        staleTime: PREFETCH_STALE_TIME_MS,
      });
    }
  }, [post.slug, postHref, queryClient, router]);

  const intentPrefetchHandlers = useIntentPrefetch({
    id: post.slug,
    prefetchedIds: prefetchedBlogPostSlugs,
    prefetch: prefetchPost,
  });

  const category = post.category || "Chia sẻ";

  return (
    <article
      {...intentPrefetchHandlers}
      className="bg-deep-black rounded border border-border-dark overflow-hidden hover:border-brand-pink/40 hover:shadow-[0_0_25px_rgba(52,211,153,0.22)] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group cursor-pointer flex flex-col justify-between h-full"
    >
      <div className="aspect-video overflow-hidden relative bg-brand-dark/50">
        <Image
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-all duration-300 group-hover:scale-105"
          src={post.thumbnailUrl || "https://via.placeholder.com/300x200"}
        />
        <div className="absolute top-4 left-4 z-10">
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm border ${getCategoryColorClass(
              category
            )}`}
          >
            {category}
          </span>
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col justify-between">
        <div>
          <Link href={postHref}>
            <h3 className="text-[16px] md:text-[18px] font-bold text-cream mb-3 group-hover:text-brand-pink transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h3>
          </Link>
          <p className="text-[13px] text-muted-taupe line-clamp-2 leading-relaxed mb-6">
            {post.excerpt}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-border-dark/60 mt-auto">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border-dark bg-brand-dark flex-shrink-0">
            <Image
              alt={post.author.fullName}
              fill
              sizes="32px"
              className="object-cover"
              src={post.author.avatarUrl || "https://via.placeholder.com/32"}
            />
          </div>
          <div className="text-[11px]">
            <p className="font-bold text-cream leading-tight">
              {post.author.fullName}
            </p>
            <p className="text-muted-taupe leading-none mt-0.5">
              {formatDate(post.publishedAt)} • {post.readingMinutes} phút
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
