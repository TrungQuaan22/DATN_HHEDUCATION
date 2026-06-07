"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import {
  getLearningCourseOverview,
  getLearningLesson,
} from "@/features/courses/api";
import type { LearningCourseOverview } from "@/features/courses/types";
import { getSubjectBadgeStyles, getSubjectLabel } from "@/lib/utils/subject";
import {
  isQueryFresh,
  PREFETCH_STALE_TIME_MS,
  useIntentPrefetch,
} from "@/lib/utils/prefetch";

const prefetchedCourseSlugs = new Set<string>();

interface Teacher {
  fullName: string;
}

interface CourseItem {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  subject: string;
  grade: number;
  totalLessons: number;
  completedLessons: number;
  teacher: Teacher;
}

interface StudentCourseCardProps {
  course: CourseItem;
}

export default function StudentCourseCard({ course }: StudentCourseCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const progressPercentage =
    course.totalLessons > 0
      ? Math.round((course.completedLessons / course.totalLessons) * 100)
      : 0;
  const learningHref = `/student/courses/${course.slug}`;

  const prefetchCourse = useCallback(async () => {
    const overviewQueryKey = ["learning-course-overview", course.slug] as const;
    router.prefetch(learningHref);

    const overview = isQueryFresh(
      queryClient,
      overviewQueryKey,
      PREFETCH_STALE_TIME_MS,
    )
      ? queryClient.getQueryData<LearningCourseOverview>(overviewQueryKey)
      : await queryClient.fetchQuery({
          queryKey: overviewQueryKey,
          queryFn: () => getLearningCourseOverview(course.slug),
          staleTime: PREFETCH_STALE_TIME_MS,
        });

    const firstLessonId = overview?.chapters
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .flatMap((chapter) =>
        chapter.lessons
          .slice()
          .sort((a, b) => a.orderIndex - b.orderIndex),
      )[0]?.id;

    if (!firstLessonId) {
      return;
    }

    const lessonQueryKey = ["learning-lesson-detail", firstLessonId] as const;
    router.prefetch(`${learningHref}?lessonId=${firstLessonId}`);

    if (!isQueryFresh(queryClient, lessonQueryKey, PREFETCH_STALE_TIME_MS)) {
      await queryClient.prefetchQuery({
        queryKey: lessonQueryKey,
        queryFn: () => getLearningLesson(firstLessonId),
        staleTime: PREFETCH_STALE_TIME_MS,
      });
    }
  }, [course.slug, learningHref, queryClient, router]);

  const intentPrefetchHandlers = useIntentPrefetch({
    id: course.slug,
    prefetchedIds: prefetchedCourseSlugs,
    prefetch: prefetchCourse,
  });

  return (
    <div
      {...intentPrefetchHandlers}
      className="bg-deep-black rounded border border-border-dark overflow-hidden flex flex-col group hover:border-brand-pink/30 transition-all shadow-md"
    >
      {/* Thumbnail Header */}
      <div className="h-40 bg-off-black bg-gradient-to-br from-brand-pink/10 to-brand-dark flex flex-col items-center justify-center p-6 relative">
        {course.thumbnailUrl ? (
          <img
            alt={course.title}
            src={course.thumbnailUrl}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <BookOpen
            size={44}
            className="text-brand-pink opacity-80 group-hover:scale-110 transition-transform"
          />
        )}
        <span
          className={`absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border z-10 ${getSubjectBadgeStyles(
            course.subject
          )}`}
        >
          {getSubjectLabel(course.subject)}
        </span>
      </div>

      {/* Content body */}
      <div className="p-5 flex-grow flex flex-col gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-text">
            <GraduationCap size={14} />
            <span>
              Lớp {course.grade} • {course.teacher.fullName}
            </span>
          </div>
          <h3 className="text-[15px] font-bold text-cream group-hover:text-brand-pink transition-colors line-clamp-2 mt-1">
            {course.title}
          </h3>
        </div>

        {/* Progress Tracker */}
        <div className="space-y-1.5 mt-auto">
          <div className="flex justify-between text-[11px] font-semibold text-muted-text">
            <span>
              {course.completedLessons > 0
                ? `Đã học ${course.completedLessons} / ${course.totalLessons} bài`
                : "Chưa học bài nào"}
            </span>
            <span
              className={
                progressPercentage > 0 ? "text-brand-pink" : "text-muted-text"
              }
            >
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-brand-dark border border-border-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-pink rounded-full transition-all duration-500"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor:
                  course.subject === "math"
                    ? "#10B981"
                    : course.subject === "english"
                    ? "#38BDF8"
                    : "#FF69B4",
              }}
            />
          </div>
        </div>

        <Link
          href={learningHref}
          className="w-full text-center bg-brand-pink text-brand-dark hover:scale-[1.02] active:scale-[0.98] font-bold text-[12px] py-2.5 rounded transition-all cursor-pointer flex items-center justify-center gap-1 uppercase"
        >
          Vào học ngay
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
