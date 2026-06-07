"use client";

import React from "react";
import Link from "next/link";

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  publishedAt: string;
}

interface BlogRelatedPostsProps {
  relatedArticles: RelatedPost[];
  formatDate: (dateStr: string) => string;
}

export default function BlogRelatedPosts({
  relatedArticles,
  formatDate,
}: BlogRelatedPostsProps) {
  if (relatedArticles.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-[12px] font-bold text-muted-taupe uppercase tracking-widest">
        Bài viết liên quan
      </h3>
      <div className="space-y-4">
        {relatedArticles.map((rel) => (
          <Link
            key={rel.id}
            href={`/blog/${rel.slug}`}
            className="flex gap-4 items-center p-3 rounded-lg hover:bg-deep-black border border-transparent hover:border-border-dark transition-all group"
          >
            <div className="w-20 h-15 rounded-lg overflow-hidden flex-shrink-0 bg-brand-dark/50">
              <img
                alt={rel.title}
                className="w-full h-full object-cover transition-all duration-300"
                src={rel.thumbnailUrl || ""}
              />
            </div>
            <div className="flex-1">
              <h4 className="text-[13px] font-bold text-cream line-clamp-2 leading-snug group-hover:text-brand-pink transition-colors">
                {rel.title}
              </h4>
              <p className="text-muted-taupe text-[11px] mt-1">
                {formatDate(rel.publishedAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
