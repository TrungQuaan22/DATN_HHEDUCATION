"use client";

import React from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { AdminCourseChapter, AdminCourseLesson } from "../types";
import ChapterNode from "./chapter-node";

interface CurriculumBuilderListProps {
  chapters: AdminCourseChapter[];
  expandedChapters: Record<string, boolean>;
  onToggleChapter: (chapterId: string) => void;
  onAddChapter: () => void;
  onEditChapter: (chapter: { id: string; title: string }) => void;
  onDeleteChapter: (chapterId: string) => void;
  onAddLesson: (chapterId: string) => void;
  onEditLesson: (lesson: AdminCourseLesson, chapterId: string) => void;
  onDeleteLesson: (lessonId: string, chapterId: string) => void;
  onDragEnd: (result: DropResult) => void;
  isPending?: boolean;
}

export default function CurriculumBuilderList({
  chapters,
  expandedChapters,
  onToggleChapter,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onDragEnd,
  isPending = false,
}: CurriculumBuilderListProps) {
  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={isPending ? () => {} : onDragEnd}>
        <Droppable droppableId="all-chapters" type="CHAPTER">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {chapters.map((chapter, chIdx) => (
                <ChapterNode
                  key={chapter.id}
                  chapter={chapter}
                  index={chIdx}
                  isExpanded={!!expandedChapters[chapter.id]}
                  isPending={isPending}
                  onToggleChapter={onToggleChapter}
                  onAddLesson={onAddLesson}
                  onEditChapter={onEditChapter}
                  onDeleteChapter={onDeleteChapter}
                  onEditLesson={onEditLesson}
                  onDeleteLesson={onDeleteLesson}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Chapter Button */}
      <button
        onClick={onAddChapter}
        disabled={isPending}
        className="w-full py-5 border-2 border-dashed border-admin-border/30 hover:border-admin-pink/50 rounded text-admin-muted hover:text-admin-pink hover:bg-admin-surface-low/30 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group mt-4 disabled:opacity-40 disabled:pointer-events-none"
      >
        <div className="bg-admin-surface-low group-hover:bg-admin-pink/10 text-admin-muted group-hover:text-admin-pink w-9 h-9 rounded-full flex items-center justify-center transition-colors">
          <Plus size={16} />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider">
          Thêm chương mới
        </span>
      </button>
    </div>
  );
}
