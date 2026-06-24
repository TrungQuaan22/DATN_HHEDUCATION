"use client";

import React from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { GripVertical, Plus, Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { AdminCourseChapter, AdminCourseLesson } from "../types";
import LessonNode from "./lesson-node";

interface ChapterNodeProps {
  chapter: AdminCourseChapter;
  index: number;
  isExpanded: boolean;
  isPending: boolean;
  onToggleChapter: (chapterId: string) => void;
  onAddLesson: (chapterId: string) => void;
  onEditChapter: (chapter: { id: string; title: string }) => void;
  onDeleteChapter: (chapterId: string) => void;
  onEditLesson: (lesson: AdminCourseLesson, chapterId: string) => void;
  onDeleteLesson: (lessonId: string, chapterId: string) => void;
}

export default function ChapterNode({
  chapter,
  index,
  isExpanded,
  isPending,
  onToggleChapter,
  onAddLesson,
  onEditChapter,
  onDeleteChapter,
  onEditLesson,
  onDeleteLesson,
}: ChapterNodeProps) {
  return (
    <Draggable
      key={chapter.id}
      draggableId={chapter.id}
      index={index}
      isDragDisabled={isPending}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-admin-deep rounded border border-admin-border/30 overflow-hidden shadow-md ${
            snapshot.isDragging
              ? "border-admin-pink shadow-2xl bg-admin-surface-low/40"
              : ""
          }`}
        >
          {/* Chapter Header */}
          <div
            onClick={() => onToggleChapter(chapter.id)}
            className="bg-admin-surface-low p-4 flex items-center justify-between border-b border-admin-border/10 cursor-pointer select-none group"
          >
            <div
              className="flex items-center gap-3 min-w-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div
                {...provided.dragHandleProps}
                className={`text-admin-muted hover:text-admin-pink p-1 transition-opacity ${
                  isPending ? "opacity-30 cursor-not-allowed" : "cursor-grab"
                }`}
                title={isPending ? undefined : "Kéo thả để sắp xếp chương"}
              >
                <GripVertical size={16} />
              </div>

              <h2 className="font-bold text-base text-admin-cream truncate">
                {chapter.title}
              </h2>

              <span className="text-xs text-admin-muted bg-admin-deep px-2 py-0.5 rounded-md border border-admin-border/10">
                {chapter.lessons.length} bài học
              </span>
            </div>

            {/* Header Actions */}
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onAddLesson(chapter.id)}
                disabled={isPending}
                className="text-admin-pink border border-admin-pink/20 hover:bg-admin-pink hover:text-white px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                <Plus size={12} />
                Thêm bài học
              </button>

              <button
                onClick={() =>
                  onEditChapter({
                    id: chapter.id,
                    title: chapter.title,
                  })
                }
                disabled={isPending}
                className="p-1.5 text-admin-muted hover:text-admin-cream bg-admin-deep/50 hover:bg-admin-deep rounded-lg transition-colors cursor-pointer border border-admin-border/5 disabled:opacity-40 disabled:pointer-events-none"
                title="Sửa tiêu đề chương"
              >
                <Edit size={13} />
              </button>

              <button
                onClick={() => onDeleteChapter(chapter.id)}
                disabled={isPending}
                className="p-1.5 text-admin-muted hover:text-red-400 bg-admin-deep/50 hover:bg-admin-deep rounded-lg transition-colors cursor-pointer border border-admin-border/5 disabled:opacity-40 disabled:pointer-events-none"
                title="Xóa chương"
              >
                <Trash2 size={13} />
              </button>

              <button
                onClick={() => onToggleChapter(chapter.id)}
                className="p-1.5 text-admin-muted hover:text-admin-cream cursor-pointer"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {/* Lessons List Inside Chapter */}
          {isExpanded && (
            <Droppable droppableId={chapter.id} type="LESSON">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="p-4 bg-admin-off/40 space-y-2.5"
                >
                  {chapter.lessons.length === 0 ? (
                    <div className="py-8 text-center text-xs text-admin-muted italic">
                      Chưa có bài học nào trong chương này. Nhấp &quot;Thêm bài học&quot; để bắt đầu.
                    </div>
                  ) : (
                    chapter.lessons.map((lesson, lesIdx) => (
                      <LessonNode
                        key={lesson.id}
                        lesson={lesson}
                        chapterId={chapter.id}
                        index={lesIdx}
                        isPending={isPending}
                        onEditLesson={onEditLesson}
                        onDeleteLesson={onDeleteLesson}
                      />
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );
}
