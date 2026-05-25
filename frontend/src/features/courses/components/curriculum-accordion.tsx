'use client';

import { useState } from 'react';
import { CourseChapter } from '@/types/common';
import { PlayCircle, Lock, Unlock, ChevronDown } from 'lucide-react';

type CurriculumAccordionProps = {
  chapters: CourseChapter[];
};

export default function CurriculumAccordion({ chapters }: CurriculumAccordionProps) {
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({
    [chapters[0]?.id || '']: true, // Open the first chapter by default
  });

  const toggleChapter = (id: string) => {
    setOpenChapters((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDuration = (sec: number | null) => {
    if (!sec) return '00:00';
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {chapters.map((chapter, index) => {
        const isOpen = openChapters[chapter.id];
        const numLabel = (index + 1).toString().padStart(2, '0');
        
        // Calculate total chapter duration
        const totalDurationSec = chapter.lessons.reduce((acc, curr) => acc + (curr.durationSec || 0), 0);
        const totalMins = Math.floor(totalDurationSec / 60);

        return (
          <div
            key={chapter.id}
            className="border border-border-dark rounded-lg overflow-hidden bg-deep-black transition-all duration-200"
          >
            {/* Chapter Header */}
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="w-full flex items-center justify-between p-5 cursor-pointer hover:bg-off-black transition-colors text-left"
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
                  isOpen ? 'transform rotate-180 text-brand-pink' : ''
                }`}
              />
            </button>

            {/* Chapter Lessons List */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-[1000px] border-t border-border-dark' : 'max-h-0 overflow-hidden'
              }`}
            >
              <div className="p-5 space-y-3 bg-brand-dark/20">
                {chapter.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between py-2 group hover:text-brand-pink transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <PlayCircle size={16} className="text-muted-taupe group-hover:text-brand-pink transition-colors" />
                      <span className="text-[14px] font-medium text-cream group-hover:text-brand-pink transition-colors">
                        {lesson.title}
                      </span>
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
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
