"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  FileText,
  ArrowRight,
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { LearningSidebar } from "@/features/courses/components/learning-sidebar";
import { AiTutorChat } from "@/features/courses/components/ai-tutor-chat";
import { useStudentLearning } from "@/features/courses/hooks/use-student-learning";
import { StudentLearningHeader } from "@/features/courses/components/student-learning-header";
import { LessonRenderer } from "@/features/courses/components/lesson-renderer";
import { LessonTabs } from "@/features/courses/components/lesson-tabs";

function StudentLearningContent() {
  const router = useRouter();
  const {
    slug,
    course,
    isLoading,
    activeTab,
    setActiveTab,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    activeLessonSummary,
    activeLessonId,
    activeLesson,
    isLessonLoading,
    activeChapter,
    isLessonCompleted,
    saveProgress,
    openLesson,
    courseProgressPercentage,
    isUnknownLesson,
    hasPreviousLesson,
    hasNextLesson,
    goToPreviousLesson,
    goToNextLesson,
  } = useStudentLearning();

  if (isLoading) {
    return <LearningPageLoading />;
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-brand-dark p-6">
        <EmptyState
          icon={<span className="text-4xl mb-3">🎓</span>}
          title="Không tìm thấy khóa học"
          description="Khóa học này không tồn tại hoặc bạn chưa được cấp quyền học."
          action={
            <Link
               href="/student/courses"
               className="inline-flex items-center gap-1.5 bg-brand-pink text-brand-dark px-5 py-2 rounded font-bold text-xs hover:scale-105 transition-all"
            >
              <ChevronLeft size={14} />
              Quay lại danh sách khóa học
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col relative overflow-hidden select-none">
      {/* Top Header */}
      <StudentLearningHeader
        course={course}
        courseProgressPercentage={courseProgressPercentage}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Layout Area */}
      <div className="flex-grow flex flex-row relative h-[calc(100vh-56px)] overflow-hidden">
        {/* Left Pane: Curriculum List (Desktop) */}
        <LearningSidebar
          course={course}
          activeLessonId={activeLessonId}
          onSelectLesson={openLesson}
          isCollapsed={isSidebarCollapsed}
        />

        {/* Mobile Sidebar Drawer Backdrop */}
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className={`learning-fade-backdrop fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-all duration-300 ${
            isMobileMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        />
        <aside
          className={`learning-slide-panel fixed left-0 top-[56px] bottom-0 w-[280px] bg-deep-black border-r border-border-dark z-50 flex flex-col md:hidden transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-border-dark bg-off-black shrink-0">
            <h3 className="text-xs font-extrabold text-cream uppercase tracking-wider">
              Nội dung khóa học
            </h3>
          </div>
          <LearningSidebar
            course={course}
            activeLessonId={activeLessonId}
            onSelectLesson={openLesson}
            isMobile={true}
            onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
          />
        </aside>

        {/* Middle Canvas: Player and Tabs */}
        <div className="flex-grow flex flex-col h-full overflow-y-auto p-4 sm:p-6 space-y-6">
          {isUnknownLesson ? (
            <EmptyState
              icon={<BookOpen className="w-12 h-12 text-muted-text/50 mb-3" />}
              title="Không tìm thấy bài học"
              description="Bài học này không thuộc khóa học hiện tại hoặc đã bị gỡ khỏi chương trình."
              action={
                <button
                  onClick={() => router.push(`/student/courses/${slug}`)}
                  className="rounded bg-brand-pink px-4 py-2 text-xs font-bold text-brand-dark hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Xem tổng quan khóa học
                </button>
              }
              className="min-h-[400px] border-none bg-transparent"
            />
          ) : activeLessonSummary && isLessonLoading ? (
            <LearningLessonSkeleton course={course} />
          ) : activeLesson ? (
            <div className="space-y-4 max-w-[900px] mx-auto w-full">
              <div className="flex flex-col gap-1 border-b border-border-dark/60 pb-4">
                <h1 className="text-xl font-extrabold leading-tight text-cream sm:text-2xl">
                  {course.title}
                </h1>
                <p className="text-sm font-semibold text-muted-text">
                  Giảng viên: {course.teacher.fullName}
                </p>
              </div>

              {course.assessmentPlacements.length > 0 && (
                <div className="rounded border border-accent-orange/30 bg-accent-orange/10 px-4 py-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-accent-orange">
                        <FileText size={14} />
                        Assessment khóa học
                      </div>
                      <p className="mt-1 truncate text-sm font-bold text-cream">
                        {course.assessmentPlacements[0].title}
                      </p>
                    </div>
                    <Link
                      href={`/student/assessments/${course.assessmentPlacements[0].id}`}
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded bg-accent-orange px-4 py-2 text-xs font-bold text-brand-dark transition-all hover:scale-[1.02] active:scale-95"
                    >
                      Làm bài
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}

              {/* Lesson Media/Content Renderer */}
              <LessonRenderer
                activeLesson={activeLesson}
                saveProgress={saveProgress}
              />

              {/* Navigation Bar */}
              <div className="flex items-center justify-between gap-4 py-2 border-b border-border-dark/60">
                <button
                  onClick={goToPreviousLesson}
                  disabled={!hasPreviousLesson}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded font-bold text-xs border border-border-dark bg-surface-input text-cream hover:text-brand-pink disabled:opacity-40 disabled:hover:text-cream disabled:hover:border-border-dark hover:scale-[1.02] active:scale-95 disabled:scale-100 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Bài trước
                </button>
                <button
                  onClick={goToNextLesson}
                  disabled={!hasNextLesson}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded font-bold text-xs bg-brand-pink text-brand-dark hover:bg-brand-pink/90 disabled:opacity-40 disabled:bg-brand-pink disabled:hover:bg-brand-pink hover:scale-[1.02] active:scale-95 disabled:scale-100 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  Bài tiếp theo
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Title and Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <div className="flex flex-col gap-1 min-w-0">
                  <h2 className="text-lg font-extrabold text-cream leading-tight truncate">
                    Bài {activeLesson.orderIndex} - {activeLesson.title}
                  </h2>
                  {activeChapter && (
                    <p className="text-xs text-muted-text font-semibold truncate">
                      Chương {activeChapter.orderIndex} - {activeChapter.title}
                    </p>
                  )}
                </div>

                {/* Progress status or Timer */}
                {activeLesson.type === "video" && isLessonCompleted && (
                  <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 bg-deep-black/80 backdrop-blur-md border border-brand-pink/30 px-3 py-1.5 rounded-full text-brand-pink text-xs font-bold shadow-md">
                        <CheckCircle2
                          size={13}
                          className="text-brand-pink"
                        />
                        <span>Đã hoàn thành 🎓</span>
                      </div>
                  </div>
                )}
              </div>

              {/* Tabs Menu */}
              <LessonTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                description={activeLesson.description}
                materials={activeLesson.materials}
              />
            </div>
          ) : (
            <EmptyState
              icon={<BookOpen className="w-12 h-12 text-muted-text/30 mb-3" />}
              title="Chọn bài học để bắt đầu"
              description="Chọn một bài học từ danh mục bên trái để bắt đầu học."
              className="min-h-[400px] border-none bg-transparent"
            />
          )}
        </div>

        {/* Right Collapsible Panel: Chat AI Tutor */}
        <AiTutorChat
          isQuiz={
            activeLesson?.type === "quiz" ||
            activeLessonSummary?.type === "quiz"
          }
          courseId={course.id}
          lessonId={activeLessonId}
        />
      </div>
    </div>
  );
}

function LearningPageLoading() {
  return (
    <div className="min-h-screen bg-brand-dark">
      <div className="h-[56px] border-b border-border-dark/60 bg-deep-black" />
      <div className="flex h-[calc(100vh-56px)]">
        <aside className="hidden w-[320px] border-r border-border-dark/60 bg-deep-black md:block">
          <div className="space-y-3 p-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded bg-muted-text/10"
              />
            ))}
          </div>
        </aside>
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-[900px] space-y-4">
            <div className="space-y-2 border-b border-border-dark/60 pb-4">
              <div className="h-8 w-2/3 animate-pulse rounded bg-muted-text/15" />
              <div className="h-4 w-48 animate-pulse rounded bg-muted-text/10" />
            </div>
            <div className="aspect-video animate-pulse rounded border border-border-dark bg-deep-black" />
            <div className="h-12 animate-pulse rounded border border-border-dark bg-deep-black" />
            <div className="h-24 animate-pulse rounded border border-border-dark bg-deep-black" />
          </div>
        </main>
      </div>
    </div>
  );
}

function LearningLessonSkeleton({
  course,
}: {
  course: { title: string; teacher: { fullName: string } };
}) {
  return (
    <div className="mx-auto w-full max-w-[900px] space-y-4">
      <div className="flex flex-col gap-1 border-b border-border-dark/60 pb-4">
        <h1 className="text-xl font-extrabold leading-tight text-cream sm:text-2xl">
          {course.title}
        </h1>
        <p className="text-sm font-semibold text-muted-text">
          Giảng viên: {course.teacher.fullName}
        </p>
      </div>
      <div className="aspect-video animate-pulse rounded-lg border border-border-dark bg-deep-black" />
      <div className="flex items-center justify-between gap-4 border-b border-border-dark/60 py-2">
        <div className="h-9 w-28 animate-pulse rounded bg-muted-text/10" />
        <div className="h-9 w-32 animate-pulse rounded bg-brand-pink/15" />
      </div>
      <div className="space-y-2">
        <div className="h-6 w-2/3 animate-pulse rounded bg-muted-text/15" />
        <div className="h-4 w-48 animate-pulse rounded bg-muted-text/10" />
      </div>
      <div className="h-32 animate-pulse rounded border border-border-dark bg-deep-black" />
    </div>
  );
}

export default function StudentLearningPage() {
  return (
    <Suspense fallback={<LearningPageLoading />}>
      <StudentLearningContent />
    </Suspense>
  );
}
