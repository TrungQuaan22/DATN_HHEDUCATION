"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, Play, Clock, ChevronDown } from "lucide-react";
import { LearningCourseOverview } from "../types";

interface LearningSidebarProps {
  course: LearningCourseOverview;
  activeLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
  isCollapsed?: boolean;
  isMobile?: boolean;
  onCloseMobileMenu?: () => void;
}

export function LearningSidebar({
  course,
  activeLessonId,
  onSelectLesson,
  isCollapsed = false,
  isMobile = false,
  onCloseMobileMenu,
}: LearningSidebarProps) {
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (course) {
      const initial: Record<string, boolean> = {};
      course.chapters.forEach((ch) => {
        initial[ch.id] = true;
      });
      setExpandedChapters(initial);
    }
  }, [course]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const renderChapters = () => {
    return course.chapters.map((chapter) => {
      const isExpanded = !!expandedChapters[chapter.id];
      return (
        <div key={chapter.id} className="py-2.5">
          <button
            onClick={() => toggleChapter(chapter.id)}
            className="w-full text-left px-4 py-2 bg-surface-input/50 hover:bg-surface-input/80 border-y border-border-dark/40 flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-extrabold text-brand-pink uppercase tracking-widest">
                Chương {chapter.orderIndex}
              </span>
              <h4 className="text-sm font-bold text-cream mt-0.5 leading-snug truncate">
                {chapter.title}
              </h4>
            </div>
            <ChevronDown
              size={14}
              className={`text-muted-text group-hover:text-brand-pink transition-transform shrink-0 ${
                isExpanded ? "" : "-rotate-90"
              }`}
            />
          </button>

          <div
            className={`space-y-0.5 transition-all duration-300 ease-in-out ${
              isExpanded
                ? "max-h-[1000px] opacity-100 py-1"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            {chapter.lessons.map((lesson) => {
              const isSelected = lesson.id === activeLessonId;
              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    onSelectLesson(lesson.id);
                    if (isMobile && onCloseMobileMenu) {
                      onCloseMobileMenu();
                    }
                  }}
                  className={`w-full flex items-start text-left px-4 py-2.5 transition-all gap-2.5 ${
                    isSelected
                      ? "bg-brand-pink/10"
                      : "hover:bg-off-black/45"
                  }`}
                >
                  {lesson.progress.isCompleted ? (
                    <CheckCircle2
                      size={14}
                      className="text-brand-pink shrink-0 mt-0.5"
                    />
                  ) : (
                    <Circle
                      size={14}
                      className="text-muted-text shrink-0 mt-0.5"
                    />
                  )}
                  <div className="flex-grow min-w-0">
                    <p
                      className={`text-sm font-bold truncate leading-tight ${
                        isSelected ? "text-brand-pink" : "text-cream"
                      }`}
                    >
                      {isMobile
                        ? `Chương ${chapter.orderIndex} - Bài ${lesson.orderIndex}: ${lesson.title}`
                        : `Bài ${lesson.orderIndex}: ${lesson.title}`}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-text">
                      {lesson.type === "video" ? (
                        <Play size={11} className="text-brand-pink" />
                      ) : (
                        <Clock size={11} className="text-accent-orange" />
                      )}
                      <span>
                        {lesson.type === "video"
                          ? "Video bài giảng"
                          : lesson.type === "quiz"
                            ? "Trắc nghiệm"
                            : "Tài liệu"}
                      </span>
                      {lesson.durationSec && (
                        <>
                          <span>•</span>
                          <span>
                            {Math.round(lesson.durationSec / 60)} phút
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    });
  };

  if (isMobile) {
    return (
      <div className="flex-grow overflow-y-auto divide-y divide-border-dark/30">
        {renderChapters()}
      </div>
    );
  }

  return (
    <aside
      className={`learning-sidebar-shell relative h-full hidden md:block shrink-0 overflow-hidden ${
        isCollapsed ? "w-0" : "w-[320px]"
      }`}
    >
      <div
        className={`learning-slide-panel absolute left-0 top-0 h-full w-[320px] border-r border-border-dark/60 bg-deep-black flex flex-col shrink-0 transition-transform duration-300 ${
          isCollapsed ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-border-dark bg-off-black flex justify-between items-center shrink-0">
          <h3 className="text-sm font-extrabold text-cream uppercase tracking-wider">
            Nội dung khóa học
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border-dark/30">
          {renderChapters()}
        </div>
      </div>
    </aside>
  );
}
