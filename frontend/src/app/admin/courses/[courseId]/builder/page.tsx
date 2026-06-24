"use client";

import { Info, Sparkles } from "lucide-react";
import { useCurriculumBuilder } from "@/features/courses/hooks/use-curriculum-builder";
import ChapterModal from "@/features/courses/components/chapter-modal";
import LessonModal from "@/features/courses/components/lesson-modal";
import CurriculumBuilderHeader from "@/features/courses/components/curriculum-builder-header";
import CurriculumBuilderList from "@/features/courses/components/curriculum-builder-list";

export default function AdminCurriculumBuilderPage() {
  const {
    chapters,
    courseInfo,
    hasMounted,
    expandedChapters,
    isChapterModalOpen,
    setIsChapterModalOpen,
    editingChapter,
    setEditingChapter,
    isLessonModalOpen,
    setIsLessonModalOpen,
    setTargetChapterIdForLesson,
    editingLesson,
    setEditingLesson,
    notification,
    isLoading,
    toggleChapter,
    handleSaveChapter,
    handleDeleteChapter,
    handleSaveLesson,
    handleDeleteLesson,
    handleDragEnd,
    handlePublish,
    handleArchive,
    handleEditSettings,
    isAnyMutationPending,
    publishMutation,
    archiveMutation,
  } = useCurriculumBuilder();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <CurriculumBuilderHeader
        courseTitle={courseInfo?.title || null}
        courseStatus={courseInfo?.status}
        onPublish={handlePublish}
        onArchive={handleArchive}
        isPublishPending={publishMutation.isPending}
        isArchivePending={archiveMutation.isPending}
        onEditSettings={handleEditSettings}
      />

      {/* Alert status box */}
      <div className="bg-admin-surface-low/50 text-admin-cream p-4 rounded flex items-start gap-3 border border-admin-border/20">
        <Info className="text-admin-pink w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold">
            {courseInfo?.status === "draft"
              ? "Khóa học đang ở chế độ Nháp (Draft). Bạn có thể kéo thả để thay đổi vị trí các chương, bài học để cấu trúc chương trình học."
              : "Khóa học đang được hiển thị cho học sinh. Các thay đổi về cấu trúc bài học sẽ cập nhật trực tiếp vào chương trình học tập của học viên."}
          </p>
        </div>
      </div>

      {/* Curriculum Builder main Canvas */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-admin-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-admin-muted text-sm font-medium">
            Đang nạp dữ liệu chương trình học...
          </p>
        </div>
      ) : !hasMounted ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-admin-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-admin-muted text-sm font-medium">
            Khởi tạo trình kéo thả...
          </p>
        </div>
      ) : (
        <CurriculumBuilderList
          chapters={chapters}
          expandedChapters={expandedChapters}
          onToggleChapter={toggleChapter}
          onAddChapter={() => {
            setEditingChapter(null);
            setIsChapterModalOpen(true);
          }}
          onEditChapter={(ch) => {
            setEditingChapter(ch);
            setIsChapterModalOpen(true);
          }}
          onDeleteChapter={handleDeleteChapter}
          onAddLesson={(chId) => {
            setTargetChapterIdForLesson(chId);
            setEditingLesson(null);
            setIsLessonModalOpen(true);
          }}
          onEditLesson={(les, chId) => {
            setEditingLesson({ lesson: les, chapterId: chId });
            setTargetChapterIdForLesson(null);
            setIsLessonModalOpen(true);
          }}
          onDeleteLesson={handleDeleteLesson}
          onDragEnd={handleDragEnd}
          isPending={isAnyMutationPending}
        />
      )}

      {/* Chapter Modal */}
      <ChapterModal
        isOpen={isChapterModalOpen}
        onClose={() => {
          setIsChapterModalOpen(false);
          setEditingChapter(null);
        }}
        onSave={handleSaveChapter}
        initialTitle={editingChapter?.title || ""}
      />

      {/* Lesson Modal */}
      <LessonModal
        isOpen={isLessonModalOpen}
        onClose={() => {
          setIsLessonModalOpen(false);
          setTargetChapterIdForLesson(null);
          setEditingLesson(null);
        }}
        onSave={handleSaveLesson}
        initialData={editingLesson?.lesson || null}
      />

      {/* Float Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded shadow-2xl flex items-center gap-2 border text-sm font-semibold ${
              notification.type === "success"
                ? "bg-admin-deep border-emerald-500/30 text-emerald-400"
                : notification.type === "error"
                  ? "bg-admin-deep border-red-500/30 text-red-400"
                  : "bg-admin-deep border-admin-pink/30 text-admin-pink"
            }`}
          >
            <Sparkles
              size={16}
              className={notification.type === "success" ? "animate-pulse" : ""}
            />
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
