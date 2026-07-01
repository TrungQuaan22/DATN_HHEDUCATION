"use client";

import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { GripVertical, PlayCircle, FileText, HelpCircle, Edit, Trash2, AlertCircle } from "lucide-react";
import { AdminCourseLesson } from "../types";

interface LessonNodeProps {
  lesson: AdminCourseLesson;
  chapterId: string;
  index: number;
  isPending: boolean;
  onEditLesson: (lesson: AdminCourseLesson, chapterId: string) => void;
  onDeleteLesson: (lessonId: string, chapterId: string) => void;
}

// Helper formatting for seconds to MM:SS
const formatDuration = (totalSecs: number | null) => {
  if (totalSecs === null) return "";
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export default function LessonNode({
  lesson,
  chapterId,
  index,
  isPending,
  onEditLesson,
  onDeleteLesson,
}: LessonNodeProps) {
  return (
    <Draggable
      key={lesson.id}
      draggableId={lesson.id}
      index={index}
      isDragDisabled={isPending}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-admin-surface-low/40 border border-admin-border/10 rounded p-3 flex items-center justify-between hover:border-admin-pink/40 hover:bg-admin-surface-low/80 transition-all group ${
            snapshot.isDragging
              ? "border-admin-pink shadow-lg bg-admin-surface-low"
              : ""
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Drag Handle */}
            <div
              {...provided.dragHandleProps}
              className={`text-admin-muted hover:text-admin-pink p-1 transition-opacity opacity-50 group-hover:opacity-100 ${
                isPending ? "cursor-not-allowed" : "cursor-grab"
              }`}
              title={isPending ? undefined : "Kéo thả để sắp xếp bài học"}
            >
              <GripVertical size={14} />
            </div>

            {/* Lesson Icon */}
            <div className="w-8 h-8 rounded-lg bg-admin-deep border border-admin-border/20 flex items-center justify-center text-admin-pink flex-shrink-0">
              {lesson.type === "video" && <PlayCircle size={16} />}
              {lesson.type === "document" && <FileText size={16} />}
              {lesson.type === "quiz" && <HelpCircle size={16} />}
            </div>

            {/* Lesson Title & badges */}
            <div className="min-w-0 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-admin-cream truncate">
                {lesson.title}
              </span>

              {/* Preview badge */}
              {lesson.allowPreview && (
                <span className="bg-admin-pink/10 text-admin-pink text-xs font-bold px-1.5 py-0.5 rounded border border-admin-pink/20">
                  Học thử
                </span>
              )}

              {/* Video metadata */}
              {lesson.type === "video" && (
                <>
                  {lesson.videoType === "system" ? (
                    <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Video Hệ thống
                    </span>
                  ) : (
                    <span className="bg-red-500/10 text-red-400 text-xs font-bold px-1.5 py-0.5 rounded border border-red-500/20">
                      YouTube
                    </span>
                  )}
                  {lesson.durationSec && (
                    <span className="text-xs text-admin-muted">
                      ({formatDuration(lesson.durationSec)})
                    </span>
                  )}
                </>
              )}

              {/* Quiz badge */}
              {lesson.type === "quiz" && (
                <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-1.5 py-0.5 rounded border border-blue-500/20">
                  Quiz
                </span>
              )}

              {/* RAG error badge */}
              {lesson.hasRagError && (
                <span className="bg-red-500/10 text-red-400 text-xs font-bold px-1.5 py-0.5 rounded border border-red-500/20 flex items-center gap-1 animate-pulse" title="Tài liệu của bài học này nạp vào AI Tutor bị lỗi. Vui lòng vào Chỉnh sửa bài học này để thử lại.">
                  <AlertCircle size={11} className="flex-shrink-0" />
                  Lỗi AI RAG
                </span>
              )}
            </div>
          </div>

          {/* Lesson Actions */}
          <div className="flex items-center gap-1 text-admin-muted group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEditLesson(lesson, chapterId)}
              disabled={isPending}
              className="p-1 hover:text-admin-cream rounded hover:bg-admin-surface-low transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              title="Chỉnh sửa bài học"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => onDeleteLesson(lesson.id, chapterId)}
              disabled={isPending}
              className="p-1 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              title="Xóa bài học"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}
