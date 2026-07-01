"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  FileText,
  ListChecks,
  PlayCircle,
} from "lucide-react";

import type {
  AdminCourseStudentLessonProgress,
  AdminCourseStudentProgress,
} from "../types";
import {
  COURSE_PROGRESS_LABELS,
  COURSE_PROGRESS_STYLES,
  formatAdminDate,
} from "../utils/course-student-presenter";

type CourseStudentCurriculumProgressProps = {
  chapters: AdminCourseStudentProgress["chapters"];
};

export default function CourseStudentCurriculumProgress({
  chapters,
}: CourseStudentCurriculumProgressProps) {
  const [onlyIncomplete, setOnlyIncomplete] = useState(false);
  const visibleChapters = useMemo(
    () =>
      chapters
        .map((chapter) => ({
          ...chapter,
          lessons: onlyIncomplete
            ? chapter.lessons.filter((lesson) => lesson.status !== "completed")
            : chapter.lessons,
        }))
        .filter((chapter) => !onlyIncomplete || chapter.lessons.length > 0),
    [chapters, onlyIncomplete],
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-admin-cream">
            Tiến độ theo curriculum
          </h2>
          <p className="mt-1 text-sm text-admin-muted">
            Mở từng chương để kiểm tra bài đã hoàn thành, đang học và chưa bắt
            đầu.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-admin-muted">
          <input
            type="checkbox"
            checked={onlyIncomplete}
            onChange={(event) => setOnlyIncomplete(event.target.checked)}
            className="h-4 w-4 rounded border-admin-border bg-admin-deep accent-admin-pink"
          />
          Chỉ hiện bài chưa hoàn thành
        </label>
      </div>

      {visibleChapters.length === 0 ? (
        <div className="rounded-xl border border-admin-border/30 bg-admin-surface-low px-6 py-12 text-center">
          <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
          <h3 className="mt-3 font-bold text-admin-cream">
            Không còn bài chưa hoàn thành
          </h3>
          <p className="mt-1 text-sm text-admin-muted">
            Học viên đã hoàn thành toàn bộ những bài học đang có trong khóa.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleChapters.map((chapter) => (
            <details
              key={chapter.id}
              open
              className="group overflow-hidden rounded-xl border border-admin-border/30 bg-admin-surface-low"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-admin-deep/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-admin-pink/50">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-admin-pink/10 text-admin-pink">
                    <BookOpen size={16} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-admin-cream">
                      {chapter.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-admin-muted">
                      {chapter.completedLessons}/{chapter.totalLessons} bài hoàn
                      thành
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={17}
                  aria-hidden="true"
                  className="shrink-0 text-admin-muted transition-transform group-open:rotate-180"
                />
              </summary>
              <div className="divide-y divide-admin-border/20 border-t border-admin-border/25">
                {chapter.lessons.map((lesson) => (
                  <LessonProgressRow key={lesson.id} lesson={lesson} />
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

function LessonProgressRow({
  lesson,
}: {
  lesson: AdminCourseStudentLessonProgress;
}) {
  const TypeIcon =
    lesson.type === "video"
      ? PlayCircle
      : lesson.type === "quiz"
        ? ListChecks
        : FileText;
  const StatusIcon =
    lesson.status === "completed"
      ? CheckCircle2
      : lesson.status === "in_progress"
        ? Clock3
        : Circle;

  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <StatusIcon
          size={17}
          aria-hidden="true"
          className={`mt-0.5 shrink-0 ${
            lesson.status === "completed"
              ? "text-emerald-400"
              : lesson.status === "in_progress"
                ? "text-amber-400"
                : "text-admin-muted"
          }`}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <TypeIcon
              size={14}
              className="shrink-0 text-admin-muted"
              aria-hidden="true"
            />
            <p className="truncate text-sm font-semibold text-admin-cream">
              {lesson.title}
            </p>
          </div>
          <p className="mt-1 text-xs text-admin-muted">
            {lesson.lastLearnedAt
              ? `Cập nhật: ${formatAdminDate(lesson.lastLearnedAt)}`
              : "Chưa có hoạt động học tập"}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 pl-7 sm:justify-end sm:pl-0">
        {lesson.status === "in_progress" && lesson.type === "video" && (
          <span className="text-xs font-semibold text-admin-muted">
            {lesson.progressPercentage}%
          </span>
        )}
        <span
          className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${COURSE_PROGRESS_STYLES[lesson.status]}`}
        >
          {COURSE_PROGRESS_LABELS[lesson.status]}
        </span>
      </div>
    </div>
  );
}
