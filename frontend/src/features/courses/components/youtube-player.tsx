"use client";

import React, { useEffect, useRef, useState } from "react";

type YouTubePlayerState = {
  PLAYING: number;
  PAUSED: number;
  ENDED: number;
};

type YouTubePlayerInstance = {
  getCurrentTime?: () => number;
  getPlayerState?: () => number;
  pauseVideo?: () => void;
  seekTo?: (seconds: number, allowSeekAhead: boolean) => void;
  destroy?: () => void;
};

type YouTubeApi = {
  Player: new (
    elementId: string,
    options: {
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
      };
    },
  ) => YouTubePlayerInstance;
  PlayerState: YouTubePlayerState;
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YouTubeApi> | null = null;

const loadYouTubeApi = () => {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("YouTube API is only available in browser"),
    );
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise<YouTubeApi>((resolve) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        resolve(window.YT!);
      };

      if (
        !document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]',
        )
      ) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.body.appendChild(script);
      }
    });
  }

  return youtubeApiPromise;
};

const getSafeCurrentTime = (player: YouTubePlayerInstance | null) => {
  if (!player || typeof player.getCurrentTime !== "function") {
    return null;
  }

  return player.getCurrentTime();
};

const getSafePlayerState = (player: YouTubePlayerInstance | null) => {
  if (!player || typeof player.getPlayerState !== "function") {
    return null;
  }

  return player.getPlayerState();
};

export const getYouTubeVideoId = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const directId = parsedUrl.searchParams.get("v");
    if (directId) return directId;

    const parts = parsedUrl.pathname.split("/").filter(Boolean);
    return parts.at(-1) ?? "";
  } catch {
    return url.split("v=")[1]?.split("&")[0] || url.split("/").pop() || "";
  }
};

type YouTubePlayerProps = {
  videoId: string;
  title: string;
  durationSec: number | null;
  initialWatchedSeconds: number;
  initialLastPositionSec: number;
  onProgressSave: (
    watchedSeconds: number,
    lastPositionSec: number,
  ) => Promise<void>;
  onProgressUpdate?: (lastPositionSec: number) => void;
};

export function YouTubePlayer({
  videoId,
  title,
  durationSec,
  initialWatchedSeconds,
  initialLastPositionSec,
  onProgressSave,
  onProgressUpdate,
}: YouTubePlayerProps) {
  const reactId = React.useId();
  const containerIdRef = useRef(`youtube-player-${reactId.replace(/:/g, "")}`);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const currentPositionRef = useRef(initialLastPositionSec);
  const furthestPositionRef = useRef(
    Math.max(initialWatchedSeconds, initialLastPositionSec),
  );
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    currentPositionRef.current = initialLastPositionSec;
    furthestPositionRef.current = Math.max(
      initialWatchedSeconds,
      initialLastPositionSec,
    );
    onProgressUpdate?.(initialLastPositionSec);
  }, [initialWatchedSeconds, initialLastPositionSec, onProgressUpdate]);

  useEffect(() => {
    let isMounted = true;
    let positionInterval: number | null = null;
    let heartbeatInterval: number | null = null;

    const saveCurrentProgress = () => {
      const currentTime = getSafeCurrentTime(playerRef.current);
      if (currentTime == null) return;

      const current = Math.floor(currentTime);
      currentPositionRef.current = current;
      furthestPositionRef.current = Math.max(
        furthestPositionRef.current,
        current,
      );
      onProgressSave(furthestPositionRef.current, current).catch(console.error);
    };

    loadYouTubeApi()
      .then((YT) => {
        if (!isMounted) return;

        playerRef.current = new YT.Player(containerIdRef.current, {
          videoId,
          playerVars: {
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              if (!isMounted || !playerRef.current) return;

              if (
                initialLastPositionSec > 0 &&
                typeof playerRef.current.seekTo === "function"
              ) {
                playerRef.current.seekTo(initialLastPositionSec, true);
              }

              setIsPlayerReady(true);
            },
            onStateChange: (event) => {
              if (
                event.data === YT.PlayerState.PAUSED ||
                event.data === YT.PlayerState.ENDED
              ) {
                saveCurrentProgress();
              }
            },
          },
        });

        positionInterval = window.setInterval(() => {
          const player = playerRef.current;
          if (!player || !isMounted) return;

          const state = getSafePlayerState(player);
          if (state !== YT.PlayerState.PLAYING) return;

          const currentTime = getSafeCurrentTime(player);
          if (currentTime == null) return;

          const current = Math.floor(currentTime);
          currentPositionRef.current = current;
          furthestPositionRef.current = Math.max(
            furthestPositionRef.current,
            current,
          );
          onProgressUpdate?.(current);
        }, 1000);

        heartbeatInterval = window.setInterval(() => {
          const player = playerRef.current;
          if (!player || !isMounted) return;

          const state = getSafePlayerState(player);
          if (state === YT.PlayerState.PLAYING) {
            saveCurrentProgress();
          }
        }, 10000);
      })
      .catch(console.error);

    const handleVisibilityChange = () => {
      if (
        document.hidden &&
        typeof playerRef.current?.pauseVideo === "function"
      ) {
        playerRef.current.pauseVideo();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (positionInterval) {
        window.clearInterval(positionInterval);
      }
      if (heartbeatInterval) {
        window.clearInterval(heartbeatInterval);
      }

      saveCurrentProgress();

      if (typeof playerRef.current?.destroy === "function") {
        playerRef.current.destroy();
      }
      playerRef.current = null;
    };
  }, [
    videoId,
    durationSec,
    initialWatchedSeconds,
    initialLastPositionSec,
    onProgressSave,
    onProgressUpdate,
  ]);

  return (
    <div className="relative w-full aspect-video rounded-lg border border-border-dark overflow-hidden bg-black shadow-lg group">
      <div
        id={containerIdRef.current}
        className="w-full h-full"
        title={title}
      />
      {!isPlayerReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-cream text-xs">
          Loading video...
        </div>
      )}
    </div>
  );
}

