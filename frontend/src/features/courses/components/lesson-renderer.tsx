"use client";

import React from "react";
import Link from "next/link";
import { Play, FileText, BookOpen, ArrowRight } from "lucide-react";
import { VideoPlayer } from "./video-player";
import { YouTubePlayer, getYouTubeVideoId } from "./youtube-player";
import { EmptyState } from "@/components/ui/empty-state";
import { LearningLesson } from "../types";

interface LessonRendererProps {
  activeLesson: LearningLesson;
  saveProgress: (watchedSeconds: number, lastPositionSec: number) => Promise<void>;
}

export function LessonRenderer({
  activeLesson,
  saveProgress,
}: LessonRendererProps) {
  if (activeLesson.type === "video" && activeLesson.videoMedia) {
    return (
      <VideoPlayer
        key={activeLesson.id}
        src={activeLesson.videoMedia.url || ""}
        status={activeLesson.videoMedia.status}
        durationSec={activeLesson.durationSec}
        initialWatchedSeconds={activeLesson.progress.watchedSeconds}
        initialLastPositionSec={activeLesson.progress.lastPositionSec}
        onProgressSave={saveProgress}
      />
    );
  }

  if (
    activeLesson.type === "video" &&
    activeLesson.videoType === "youtube" &&
    activeLesson.youtubeUrl
  ) {
    return (
      <YouTubePlayer
        key={activeLesson.id}
        videoId={getYouTubeVideoId(activeLesson.youtubeUrl)}
        title={activeLesson.title}
        durationSec={activeLesson.durationSec}
        initialWatchedSeconds={activeLesson.progress.watchedSeconds}
        initialLastPositionSec={activeLesson.progress.lastPositionSec}
        onProgressSave={saveProgress}
      />
    );
  }

  if (activeLesson.type === "video") {
    return (
      <EmptyState
        icon={<Play className="w-12 h-12 text-brand-pink mb-3 opacity-50" />}
        title="Video chưa được tải lên"
        description="Bài học video này hiện chưa có tài nguyên video hệ thống. Vui lòng quay lại sau!"
        className="aspect-video w-full"
      />
    );
  }

  if (activeLesson.type === "quiz") {
    const assessmentPlacementId =
      activeLesson.assessmentPlacementId || activeLesson.assessmentPlacement?.id;

    return (
      <EmptyState
        icon={<FileText className="w-12 h-12 text-accent-orange mb-3" />}
        title={activeLesson.assessmentPlacement?.title || "Bài kiểm tra"}
        description={
          assessmentPlacementId
            ? "Hoàn thành bài kiểm tra của lesson này để tự đánh giá kiến thức."
            : "Lesson này chưa có assessment placement được xuất bản."
        }
        action={
          assessmentPlacementId ? (
            <Link
              href={`/student/assessments/${assessmentPlacementId}`}
              className="inline-flex items-center gap-1.5 rounded bg-accent-orange px-6 py-2 text-[12px] font-bold text-brand-dark transition-all hover:scale-[1.02] active:scale-95"
            >
              Làm bài ngay
              <ArrowRight size={14} />
            </Link>
          ) : null
        }
        className="aspect-video w-full"
      />
    );
  }

  return (
    <EmptyState
      icon={<BookOpen className="w-12 h-12 text-brand-pink mb-3" />}
      title="Tài liệu tự đọc"
      description="Bài đọc lý thuyết cần nghiên cứu. Bạn vui lòng đọc kỹ nội dung bên dưới."
      className="aspect-video w-full"
    />
  );
}
