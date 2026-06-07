"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import "@videojs/react/video/skin.css";
import { createPlayer } from "@videojs/react";
import { videoFeatures, VideoSkin } from "@videojs/react/video";
import { HlsVideo } from "@videojs/react/media/hls-video";

import { useAuthStore } from "@/stores/auth-store";

interface VideoPlayerProps {
  src: string;
  status:
    | "pending_upload"
    | "uploaded"
    | "processing"
    | "ready"
    | "failed"
    | "deleted";
  durationSec: number | null;
  initialWatchedSeconds: number;
  initialLastPositionSec: number;
  onProgressSave: (
    watchedSeconds: number,
    lastPositionSec: number
  ) => Promise<void>;
  onProgressUpdate?: (lastPositionSec: number) => void;
}

const Player = createPlayer({ features: videoFeatures });

function VideoPlayerContent({
  src,
  status,
  durationSec,
  initialWatchedSeconds,
  initialLastPositionSec,
  onProgressSave,
  onProgressUpdate,
}: VideoPlayerProps) {
  const media = Player.useMedia();
  const store = Player.usePlayer();
  const canPlay = Player.usePlayer((s) => s.canPlay);
  const error = Player.usePlayer((s) => s.error);

  const onProgressSaveRef = useRef(onProgressSave);
  const onProgressUpdateRef = useRef(onProgressUpdate);
  const currentPositionRef = useRef(initialLastPositionSec);
  const lastReportedPositionRef = useRef(initialLastPositionSec);
  const furthestPositionRef = useRef(
    Math.max(initialWatchedSeconds, initialLastPositionSec)
  );
  const didSeekRef = useRef(false);
  const hlsConfig = useMemo(
    () => ({
      enableWorker: true,
      maxBufferLength: 20,
      manifestLoadingMaxRetry: 2,
      fragLoadingMaxRetry: 2,
      xhrSetup: (xhr: XMLHttpRequest, url: string) => {
        const isExternal =
          url.startsWith("http") &&
          !url.includes("localhost:4000") &&
          (!process.env.NEXT_PUBLIC_API_BASE_URL ||
            !url.includes(process.env.NEXT_PUBLIC_API_BASE_URL));

        if (!isExternal) {
          const accessToken = useAuthStore.getState().accessToken;
          if (accessToken) {
            xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
          }
        }
      },
    }),
    []
  );

  const getResumePosition = useCallback(() => {
    if (!durationSec || durationSec <= 0) {
      return initialLastPositionSec;
    }
    return initialLastPositionSec >= durationSec - 2
      ? 0
      : initialLastPositionSec;
  }, [durationSec, initialLastPositionSec]);

  const saveCurrentProgress = useCallback(() => {
    const videoElement = (media as any)?.target as HTMLVideoElement | null;
    if (!videoElement) return Promise.resolve();
    const current = Math.max(0, Math.floor(videoElement.currentTime));
    currentPositionRef.current = current;
    furthestPositionRef.current = Math.max(
      furthestPositionRef.current,
      current
    );

    return onProgressSaveRef
      .current(furthestPositionRef.current, current)
      .catch(console.error);
  }, [media]);

  useEffect(() => {
    onProgressSaveRef.current = onProgressSave;
    onProgressUpdateRef.current = onProgressUpdate;
  }, [onProgressSave, onProgressUpdate]);

  // Reset didSeekRef and refs when src changes
  useEffect(() => {
    didSeekRef.current = false;
    currentPositionRef.current = initialLastPositionSec;
    lastReportedPositionRef.current = initialLastPositionSec;
    furthestPositionRef.current = Math.max(
      initialWatchedSeconds,
      initialLastPositionSec
    );
  }, [src, initialWatchedSeconds, initialLastPositionSec]);

  // Handle seeking to resume position without starting playback
  useEffect(() => {
    const videoElement = (media as any)?.target as HTMLVideoElement | null;
    if (canPlay && !didSeekRef.current && videoElement) {
      const resumePosition = getResumePosition();
      if (resumePosition > 0 && Number.isFinite(resumePosition)) {
        store.seek(resumePosition)
          .then(() => {
            store.pause();
          })
          .catch(console.error);
        store.pause();
      }
      didSeekRef.current = true;
    }
  }, [canPlay, store, media, getResumePosition]);

  // Media Event Listeners
  useEffect(() => {
    const videoElement = (media as any)?.target as HTMLVideoElement | null;
    if (!videoElement) return;

    let didSaveOnCleanup = false;

    const handleTimeUpdate = () => {
      const current = Math.max(0, Math.floor(videoElement.currentTime));
      if (current === lastReportedPositionRef.current) {
        return;
      }

      lastReportedPositionRef.current = current;
      currentPositionRef.current = current;
      furthestPositionRef.current = Math.max(
        furthestPositionRef.current,
        current
      );
      onProgressUpdateRef.current?.(current);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        store.pause();
      }
    };

    const heartbeatInterval = window.setInterval(() => {
      if (videoElement && !videoElement.paused && !videoElement.ended) {
        saveCurrentProgress();
      }
    }, 10000);

    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("seeked", saveCurrentProgress);
    videoElement.addEventListener("pause", saveCurrentProgress);
    videoElement.addEventListener("ended", saveCurrentProgress);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(heartbeatInterval);
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("seeked", saveCurrentProgress);
      videoElement.removeEventListener("pause", saveCurrentProgress);
      videoElement.removeEventListener("ended", saveCurrentProgress);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (!didSaveOnCleanup) {
        didSaveOnCleanup = true;
        saveCurrentProgress();
      }
    };
  }, [media, store, saveCurrentProgress]);

  const displayError =
    status === "ready" && !src
      ? "Không tìm thấy URL phát video."
      : error
      ? error.message || `Media error ${error.code}`
      : null;

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-lg border border-border-dark bg-black shadow-lg"
      style={{
        ["--media-border-radius" as any]: "0px",
        ["--media-video-border-radius" as any]: "0px",
      }}
    >
      {!canPlay && !displayError && (
        <div className="pointer-events-none absolute left-3 top-3 z-10 rounded bg-black/60 px-2 py-1 text-[11px] font-semibold text-muted-text">
          Đang tải video...
        </div>
      )}

      {displayError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 p-6 text-center">
          <h4 className="text-[14px] font-bold text-cream">Không phát được video</h4>
          <p className="mt-2 max-w-md break-all text-[12px] text-muted-text">
            {displayError}
          </p>
        </div>
      )}

      <VideoSkin className="h-full w-full">
        <HlsVideo
          key={src || "empty-video"}
          src={src}
          config={hlsConfig}
          playsInline
          autoPlay={false}
          className="block h-full w-full bg-black text-white [&_video]:h-full [&_video]:w-full [&_video]:object-contain"
        />
      </VideoSkin>
    </div>
  );
}

export function VideoPlayer(props: VideoPlayerProps) {
  if (props.status !== "ready") {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border border-border-dark bg-deep-black p-6 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-pink border-t-transparent" />
        <h4 className="text-[14px] font-bold text-cream">Video đang được xử lý</h4>
        <p className="max-w-xs text-[12px] text-muted-text">
          Hệ thống đang chuyển đổi video sang HLS. Vui lòng quay lại sau ít phút.
        </p>
      </div>
    );
  }

  return (
    <Player.Provider>
      <VideoPlayerContent {...props} />
    </Player.Provider>
  );
}
