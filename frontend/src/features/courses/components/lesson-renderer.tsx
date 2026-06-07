"use client";

import React from "react";
import { Play, FileText, BookOpen } from "lucide-react";
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
    return (
      <EmptyState
        icon={<FileText className="w-12 h-12 text-accent-orange mb-3" />}
        title="Bài tập trắc nghiệm"
        description="Bài học này yêu cầu bạn làm bài tập trắc nghiệm để tự kiểm tra kiến thức."
        action={
          <button className="bg-accent-orange text-brand-dark px-6 py-2 rounded font-bold text-[12px] hover:scale-[1.02] active:scale-95 transition-all">
            Làm bài kiểm tra ngay
          </button>
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
