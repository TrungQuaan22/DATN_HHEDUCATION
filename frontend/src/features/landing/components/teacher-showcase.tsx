"use client";

import React, { useState } from "react";
import TimelineMilestone from "./timeline-milestone";

interface TimelineItem {
  stage: string;
  stageColorClass: string;
  nodeColorClass: string;
  title: string;
  desc: string;
}

interface Teacher {
  name: string;
  badge: string;
  badgeColorClass: string;
  quote: string;
  avatarUrl: string;
  timeline: TimelineItem[];
}

interface TeacherStickyShowcaseProps {
  teacher: Teacher;
}

export default function TeacherStickyShowcase({
  teacher,
}: TeacherStickyShowcaseProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeNode = teacher.timeline[activeIdx] || teacher.timeline[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative pb-20 border-b border-border-dark/20 last:border-b-0 last:pb-0">
      {/* Sticky Left Column: Profile Card */}
      <div className="lg:col-span-5 lg:sticky lg:top-[120px] py-4">
        <div className="bg-deep-black/50 backdrop-blur-md border border-border-dark/80 p-8 rounded-2xl shadow-2xl relative overflow-hidden text-center transition-all duration-500 hover:border-brand-pink/20">
          {/* Dynamic background blur circle */}
          <div
            className={`absolute -top-10 -right-10 w-44 h-44 rounded-full blur-[80px] opacity-15 transition-all duration-1000 ${
              activeNode.nodeColorClass === "bg-brand-pink"
                ? "bg-brand-pink"
                : "bg-sky-blue"
            }`}
          />

          <div
            className={`relative w-44 h-44 mx-auto mb-6 rounded-full overflow-hidden border-4 transition-all duration-700 ${
              activeNode.nodeColorClass === "bg-brand-pink"
                ? "border-brand-pink/40 shadow-[0_0_25px_rgba(217,70,239,0.15)]"
                : "border-sky-blue/40 shadow-[0_0_25px_rgba(14,165,233,0.15)]"
            }`}
          >
            {teacher.avatarUrl ? (
              <img
                src={teacher.avatarUrl}
                alt={teacher.name}
                className="w-full h-full object-cover transition-transform duration-700 scale-100 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-dark to-deep-black flex items-center justify-center text-muted-taupe">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`w-16 h-16 opacity-60 transition-colors duration-700 ${
                    activeNode.nodeColorClass === "bg-brand-pink"
                      ? "text-brand-pink"
                      : "text-sky-blue"
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </div>
            )}
          </div>

          <span
            className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-3 border ${teacher.badgeColorClass}`}
          >
            {teacher.badge}
          </span>
          <h3 className="text-3xl font-bold text-cream tracking-tight">
            {teacher.name}
          </h3>
          <p className="text-base italic text-muted-taupe leading-relaxed mt-4 bg-deep-black/30 p-4 rounded-xl border border-border-dark/40">
            {teacher.quote}
          </p>

          <div className="mt-8 flex justify-center gap-2">
            {teacher.timeline.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  activeIdx === idx
                    ? activeNode.nodeColorClass === "bg-brand-pink"
                      ? "w-8 bg-brand-pink"
                      : "w-8 bg-sky-blue"
                    : "w-2 bg-muted-taupe/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scrolling Right Column: Timeline nodes */}
      <div className="lg:col-span-7 relative py-8 lg:py-[15vh]">
        {/* Continuous vertical connector line */}
        <div className="absolute left-[21px] top-12 bottom-12 w-0.5 bg-border-dark/30 z-0" />

        <div className="space-y-20 relative z-10">
          {teacher.timeline.map((item, idx) => (
            <TimelineMilestone
              key={idx}
              item={item}
              isActive={activeIdx === idx}
              onVisible={() => setActiveIdx(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
