"use client";

import React, { useEffect, useRef } from "react";

interface TimelineItem {
  stage: string;
  stageColorClass: string;
  nodeColorClass: string;
  title: string;
  desc: string;
}

interface TimelineMilestoneProps {
  item: TimelineItem;
  isActive: boolean;
  onVisible: () => void;
}

export default function TimelineMilestone({
  item,
  isActive,
  onVisible,
}: TimelineMilestoneProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible();
        }
      },
      {
        rootMargin: "-35% 0px -35% 0px",
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [onVisible]);

  return (
    <div
      ref={ref}
      className="relative pl-12 transition-all duration-700 ease-out"
    >
      {/* Node Dot */}
      <div
        className={`absolute left-3 top-5 w-5 h-5 rounded-full border-4 border-brand-dark transition-all duration-700 z-10 ${
          isActive
            ? item.nodeColorClass === "bg-brand-pink"
              ? "bg-brand-pink scale-125 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
              : "bg-sky-blue scale-125 shadow-[0_0_15px_rgba(14,165,233,0.8)]"
            : "bg-border-dark scale-100"
        }`}
      />

      <div
        className={`bg-deep-black/10 hover:bg-deep-black/20 border p-8 rounded-xl transition-all duration-500 ${
          isActive
            ? item.nodeColorClass === "bg-brand-pink"
              ? "border-brand-pink/30 shadow-[0_4px_25px_rgba(52,211,153,0.06)] bg-brand-pink/[0.01]"
              : "border-sky-blue/30 shadow-[0_4px_25px_rgba(14,165,233,0.06)] bg-sky-blue/[0.01]"
            : "border-border-dark/40"
        }`}
      >
        <span
          className={`text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            isActive ? item.stageColorClass : "text-muted-taupe/50"
          }`}
        >
          {item.stage}
        </span>
        <h4 className="text-xl font-bold text-cream mt-2 transition-colors duration-300">
          {item.title}
        </h4>
        <p className="text-base text-muted-taupe mt-3 leading-relaxed transition-colors duration-300">
          {item.desc}
        </p>
      </div>
    </div>
  );
}
