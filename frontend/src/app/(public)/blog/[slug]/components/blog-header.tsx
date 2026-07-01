"use client";

import React from "react";
import { Calendar, Clock } from "lucide-react";
import { SafeImg } from "@/components/media/safe-image";

interface BlogHeaderProps {
  post: {
    tags: string[];
    title: string;
    author: {
      fullName: string;
      avatarUrl?: string | null;
    };
    publishedAt: string;
    readingMinutes: number;
  };
  formattedDate: string;
}

export default function BlogHeader({ post, formattedDate }: BlogHeaderProps) {
  return (
    <div className="mb-12 border-b border-border-dark pb-8">
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag, idx) => (
          <span
            key={idx}
            className="bg-deep-black text-brand-pink border border-brand-pink/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      <h1 className="text-3xl md:text-5xl font-extrabold text-cream leading-tight mb-6 tracking-tight">
        {post.title}
      </h1>

      <div className="flex flex-wrap items-center gap-6 text-muted-taupe text-sm">
        <div className="flex items-center gap-3">
          <SafeImg
            alt={post.author.fullName}
            className="w-10 h-10 rounded-full object-cover border border-brand-pink bg-brand-dark"
            src={post.author.avatarUrl}
          />
          <div>
            <p className="text-cream font-bold">{post.author.fullName}</p>
            <p className="text-xs text-muted-taupe">Giảng viên sư phạm</p>
          </div>
        </div>

        <div className="w-px h-6 bg-border-dark hidden sm:block"></div>

        <div className="flex items-center gap-1.5">
          <Calendar size={16} />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock size={16} />
          <span>{post.readingMinutes} phút đọc</span>
        </div>
      </div>
    </div>
  );
}
