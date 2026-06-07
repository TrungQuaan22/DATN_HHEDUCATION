"use client";

import React from "react";
import { Calendar, Clock } from "lucide-react";

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
            className="bg-deep-black text-brand-pink border border-brand-pink/20 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      <h1 className="text-[32px] md:text-[48px] font-extrabold text-cream leading-tight mb-6 tracking-tight">
        {post.title}
      </h1>

      <div className="flex flex-wrap items-center gap-6 text-muted-taupe text-[13px]">
        <div className="flex items-center gap-3">
          <img
            alt={post.author.fullName}
            className="w-10 h-10 rounded-full object-cover border border-brand-pink bg-brand-dark"
            src={
              post.author.avatarUrl ||
              "https://lh3.googleusercontent.com/aida/ADBb0uiIek7P62jjJQjU84PIV6GsfsuyN4KmS9fL8kB6kpryaM4TkPT2F2LhGKwuC3hvfNQf_zY87X2K48fs4HvQljJNxRMwZ0xpYwr6hQldNlJiBXSZp2yCTCYv_id9QoLVARzshzEmPSCMWPAx8CKPpdvEPKzvbSJ8ma_FqeGFH5P-fWBGMyad5cxcucjCmlBAFqfbFcgGPrdQvqFI1VOucL5mtyjpHhjgUZVyiTybciyZyXUfQcNa1aVypgY"
            }
          />
          <div>
            <p className="text-cream font-bold">{post.author.fullName}</p>
            <p className="text-[11px] text-muted-taupe">Giảng viên sư phạm</p>
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
