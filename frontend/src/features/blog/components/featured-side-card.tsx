"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { BlogPostSummary } from "../types";
import { getBlogPostDetail } from "../api";
import { prefetchedBlogPostSlugs } from "../prefetch";
import {
  isQueryFresh,
  PREFETCH_STALE_TIME_MS,
  useIntentPrefetch,
} from "@/lib/utils/prefetch";

interface FeaturedSideCardProps {
  post: BlogPostSummary;
}

export function FeaturedSideCard({ post }: FeaturedSideCardProps) {
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

  return (
    <article
      {...intentPrefetchHandlers}
      className="flex-1 bg-deep-black p-6 rounded border border-border-dark hover:border-brand-pink transition-all group cursor-pointer flex flex-col justify-between"
    >
      <div>
        <span className="text-brand-pink text-xs font-bold uppercase tracking-widest block mb-2">
          {post.category?.name || "Chia sẻ"}
        </span>
        <Link href={postHref}>
          <h3 className="text-base md:text-lg font-bold text-cream mb-2 leading-snug group-hover:text-brand-pink transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-taupe line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-dark/50">
        <span className="text-xs text-muted-taupe">
          {post.readingMinutes} phút đọc
        </span>
        <span className="text-brand-pink transition-transform group-hover:translate-x-1">
          <ArrowRight size={16} />
        </span>
      </div>
    </article>
  );
}
