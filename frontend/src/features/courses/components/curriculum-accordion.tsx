"use client";

import { useState } from "react";
import { CourseChapterPublic, CourseLessonPublic } from "../types";
import { PlayCircle, Lock, Unlock, ChevronDown, X } from "lucide-react";

type CurriculumAccordionProps = {
  chapters: CourseChapterPublic[];
};

export default function CurriculumAccordion({
  chapters,
}: CurriculumAccordionProps) {
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({
    [chapters[0]?.id || ""]: true, // Open the first chapter by default
  });
  const [activePreviewLesson, setActivePreviewLesson] = useState<CourseLessonPublic | null>(null);

  const toggleChapter = (id: string) => {
    setOpenChapters((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDuration = (sec: number | null) => {
    if (!sec) return "00:00";
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getYoutubeId = (url: string | null | undefined): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="space-y-4">
      {chapters.map((chapter, index) => {
        const isOpen = openChapters[chapter.id];
        const numLabel = (index + 1).toString().padStart(2, "0");

        // Calculate total chapter duration
        const totalDurationSec = chapter.lessons.reduce(
          (acc, curr) => acc + (curr.durationSec || 0),
          0,
        );
        const totalMins = Math.floor(totalDurationSec / 60);

        return (
          <div
            key={chapter.id}
            className="border border-border-dark rounded-lg overflow-hidden bg-deep-black transition-all duration-200"
          >
            {/* Chapter Header */}
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="w-full flex items-center justify-between p-5 cursor-pointer hover:bg-off-black transition-colors text-left font-sans"
            >
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded bg-brand-pink text-white flex items-center justify-center font-bold text-[14px]">
                  {numLabel}
                </span>
                <div>
                  <p className="text-[14px] md:text-[15px] font-bold text-cream">
                    {chapter.title}
                  </p>
                  <p className="text-[11px] text-muted-taupe mt-0.5">
                    {chapter.lessons.length} bài học • {totalMins} phút
                  </p>
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`text-muted-taupe transition-transform duration-300 ${
                  isOpen ? "transform rotate-180 text-brand-pink" : ""
                }`}
              />
            </button>

            {/* Chapter Lessons List */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                isOpen
                  ? "max-h-[1000px] border-t border-border-dark"
                  : "max-h-0 overflow-hidden"
              }`}
            >
              <div className="p-5 space-y-3 bg-brand-dark/20">
                {chapter.lessons.map((lesson, index) => {
                  const isTrial = lesson.allowPreview && !!lesson.youtubeUrl;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => isTrial && setActivePreviewLesson(lesson)}
                      className={`flex items-center justify-between py-2.5 px-3 rounded transition-colors group ${
                        isTrial
                          ? "cursor-pointer hover:bg-brand-pink/5 hover:text-brand-pink"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <PlayCircle
                          size={16}
                          className={`transition-colors ${
                            isTrial
                              ? "text-sky-blue group-hover:text-brand-pink"
                              : "text-muted-taupe group-hover:text-brand-pink"
                          }`}
                        />
                        <span className="text-[14px] font-medium text-cream group-hover:text-brand-pink transition-colors">
                          Bài {index + 1}: {lesson.title}
                        </span>
                        {isTrial && (
                          <span className="text-[9px] font-bold text-white bg-sky-blue px-1.5 py-0.5 rounded tracking-wider uppercase scale-90">
                            Học thử
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-[12px] text-muted-taupe">
                        <span>{formatDuration(lesson.durationSec)}</span>
                        {lesson.allowPreview ? (
                          <span title="Xem thử miễn phí">
                            <Unlock size={14} className="text-sky-blue" />
                          </span>
                        ) : (
                          <Lock size={14} className="text-muted-taupe" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {/* YouTube Video Preview Modal */}
      {activePreviewLesson && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-deep-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setActivePreviewLesson(null)}
        >
          <div
            className="bg-deep-black w-full max-w-4xl rounded-lg shadow-2xl border border-border-dark relative overflow-hidden text-cream animate-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-dark bg-off-black">
              <div>
                <span className="text-[10px] font-bold text-brand-pink uppercase tracking-widest block mb-0.5">
                  Bài học thử miễn phí
                </span>
                <h3 className="text-[15px] font-bold text-cream">
                  {activePreviewLesson.title}
                </h3>
              </div>
              <button
                onClick={() => setActivePreviewLesson(null)}
                className="p-1.5 rounded-full hover:bg-border-dark text-muted-taupe hover:text-cream transition-all cursor-pointer"
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Content */}
            <div className="aspect-video w-full bg-black relative">
              {getYoutubeId(activePreviewLesson.youtubeUrl) ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${getYoutubeId(activePreviewLesson.youtubeUrl)}?autoplay=1&rel=0`}
                  title={activePreviewLesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <PlayCircle size={48} className="text-muted-taupe mb-4" />
                  <p className="text-[14px] text-muted-taupe">
                    Không thể tải video bài học này. Vui lòng liên hệ hỗ trợ.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
