"use client";

import { useState, useEffect } from "react";
import { AlignLeft } from "lucide-react";

type HeadingItem = {
  text: string;
  id: string;
  level: number;
};

type TableOfContentsProps = {
  headings: HeadingItem[];
};

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "0px 0px -60% 0px", // Trigger when heading is in the upper part of the screen
        threshold: 0.1,
      },
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => {
      headings.forEach((heading) => {
        const el = document.getElementById(heading.id);
        if (el) observer.unobserve(el);
      });
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="bg-deep-black p-6 rounded border border-border-dark transition-colors duration-200">
      <h3 className="text-brand-pink font-bold text-[14px] mb-4 uppercase tracking-wider flex items-center gap-2">
        <AlignLeft size={16} />
        <span>Mục lục bài viết</span>
      </h3>
      <nav className="space-y-3 text-[13px] font-medium max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const indent = heading.level === 3 ? "pl-6" : "pl-3";
          return (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`block transition-all border-l-2 py-0.5 leading-snug ${indent} ${
                isActive
                  ? "border-brand-pink text-brand-pink font-bold"
                  : "border-transparent text-muted-taupe hover:text-cream hover:border-muted-taupe"
              }`}
            >
              {heading.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
