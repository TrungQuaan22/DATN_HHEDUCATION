"use client";

import React from "react";
import Link from "next/link";

interface SiteNavLinksProps {
  isActive: (path: string) => boolean;
  onLinkClick?: () => void;
  className?: string;
  itemClassName?: string;
}

export default function SiteNavLinks({
  isActive,
  onLinkClick,
  className = "flex items-center justify-center gap-10",
  itemClassName = "text-[14px] font-medium pb-1 transition-colors",
}: SiteNavLinksProps) {
  return (
    <div className={className}>
      <Link
        href="/"
        onClick={onLinkClick}
        className={`${itemClassName} ${
          isActive("/")
            ? "text-brand-pink border-b-2 border-brand-pink"
            : "text-cream hover:text-brand-pink"
        }`}
      >
        Home
      </Link>
      <Link
        href="/courses"
        onClick={onLinkClick}
        className={`${itemClassName} ${
          isActive("/courses")
            ? "text-brand-pink border-b-2 border-brand-pink"
            : "text-cream hover:text-brand-pink"
        }`}
      >
        Courses
      </Link>
      <Link
        href="/teachers"
        onClick={onLinkClick}
        className={`${itemClassName} text-cream hover:text-brand-pink`}
      >
        Teachers
      </Link>
      <Link
        href="/blog"
        onClick={onLinkClick}
        className={`${itemClassName} ${
          isActive("/blog")
            ? "text-brand-pink border-b-2 border-brand-pink"
            : "text-cream hover:text-brand-pink"
        }`}
      >
        Blog
      </Link>
    </div>
  );
}
