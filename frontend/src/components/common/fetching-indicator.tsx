"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import NProgress from "nprogress";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

const NAVIGATION_TIMEOUT_MS = 8000;
const START_DELAY_MS = 120;
const DONE_DELAY_MS = 80;
const SILENT_MUTATION_KEYS = new Set(["lesson-progress-autosave"]);

NProgress.configure({
  showSpinner: false,
  minimum: 0.08,
  speed: 200,
  trickleSpeed: 70,
});

const isModifiedEvent = (event: MouseEvent) => {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
};

const isInternalNavigation = (url: URL) => {
  return (
    url.origin === window.location.origin &&
    `${url.pathname}${url.search}` !==
      `${window.location.pathname}${window.location.search}`
  );
};

export default function FetchingIndicator() {
  const pathname = usePathname();
  const isFetching = useIsFetching({
    predicate: (query) => {
      const meta = query.meta as { showGlobalLoading?: boolean } | undefined;

      return meta?.showGlobalLoading === true;
    },
  });
  const isMutating = useIsMutating({
    predicate: (mutation) => {
      const mutationKey = mutation.options.mutationKey;
      const rootKey = Array.isArray(mutationKey) ? String(mutationKey[0]) : "";
      const meta = mutation.options.meta as
        | { showGlobalLoading?: boolean }
        | undefined;

      return (
        !SILENT_MUTATION_KEYS.has(rootKey) &&
        meta?.showGlobalLoading === true
      );
    },
  });
  const hasQueryActivity = isFetching > 0 || isMutating > 0;
  const startTimerRef = useRef<number | null>(null);
  const doneTimerRef = useRef<number | null>(null);
  const navigationTimerRef = useRef<number | null>(null);
  const isProgressStartedRef = useRef(false);
  const hasQueryActivityRef = useRef(hasQueryActivity);
  const hasNavigationActivityRef = useRef(false);

  const clearStartTimer = useCallback(() => {
    if (!startTimerRef.current) {
      return;
    }

    window.clearTimeout(startTimerRef.current);
    startTimerRef.current = null;
  }, []);

  const clearDoneTimer = useCallback(() => {
    if (!doneTimerRef.current) {
      return;
    }

    window.clearTimeout(doneTimerRef.current);
    doneTimerRef.current = null;
  }, []);

  const scheduleStart = useCallback(() => {
    clearDoneTimer();

    if (isProgressStartedRef.current || startTimerRef.current) {
      return;
    }

    startTimerRef.current = window.setTimeout(() => {
      startTimerRef.current = null;

      if (
        !hasQueryActivityRef.current &&
        !hasNavigationActivityRef.current
      ) {
        return;
      }

      NProgress.set(0.08);
      NProgress.start();
      isProgressStartedRef.current = true;
    }, START_DELAY_MS);
  }, [clearDoneTimer]);

  const scheduleDoneIfIdle = useCallback(() => {
    if (hasQueryActivityRef.current || hasNavigationActivityRef.current) {
      return;
    }

    clearStartTimer();
    clearDoneTimer();

    doneTimerRef.current = window.setTimeout(() => {
      NProgress.done();
      isProgressStartedRef.current = false;
      doneTimerRef.current = null;
    }, DONE_DELAY_MS);
  }, [clearDoneTimer, clearStartTimer]);

  useEffect(() => {
    hasQueryActivityRef.current = hasQueryActivity;

    if (hasQueryActivity) {
      scheduleStart();
      return;
    }

    scheduleDoneIfIdle();

    return () => {
      clearDoneTimer();
    };
  }, [clearDoneTimer, hasQueryActivity, scheduleDoneIfIdle, scheduleStart]);

  useEffect(() => {
    hasNavigationActivityRef.current = false;

    if (navigationTimerRef.current) {
      window.clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }

    scheduleDoneIfIdle();
  }, [pathname, scheduleDoneIfIdle]);

  useEffect(() => {
    const startNavigationProgress = (url: URL) => {
      if (isInternalNavigation(url)) {
        hasNavigationActivityRef.current = true;

        if (navigationTimerRef.current) {
          window.clearTimeout(navigationTimerRef.current);
        }

        scheduleStart();

        navigationTimerRef.current = window.setTimeout(() => {
          navigationTimerRef.current = null;
          hasNavigationActivityRef.current = false;

          if (hasQueryActivityRef.current) {
            return;
          }

          scheduleDoneIfIdle();
        }, NAVIGATION_TIMEOUT_MS);
      }
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || isModifiedEvent(event)) {
        return;
      }

      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (
        anchor.target ||
        anchor.download ||
        anchor.getAttribute("rel") === "external"
      ) {
        return;
      }

      startNavigationProgress(new URL(anchor.href));
    };

    const originalPushState = window.history.pushState;

    window.history.pushState = function patchedPushState(...args) {
      const nextUrl = args[2] ? new URL(String(args[2]), window.location.href) : null;

      if (nextUrl) {
        startNavigationProgress(nextUrl);
      }

      return originalPushState.apply(this, args);
    };

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      window.history.pushState = originalPushState;
      if (navigationTimerRef.current) {
        window.clearTimeout(navigationTimerRef.current);
        navigationTimerRef.current = null;
      }
      clearStartTimer();
      clearDoneTimer();
      NProgress.done();
    };
  }, [clearDoneTimer, clearStartTimer, scheduleDoneIfIdle, scheduleStart]);

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          #nprogress {
            pointer-events: none;
          }

          #nprogress .bar {
            position: fixed;
            z-index: 99999;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: var(--brand-pink);
            box-shadow: 0 0 18px rgba(52, 211, 153, 0.75);
          }

          #nprogress .peg {
            display: block;
            position: absolute;
            right: 0;
            width: 160px;
            height: 100%;
            box-shadow: 0 0 14px var(--brand-pink), 0 0 8px var(--brand-pink);
            opacity: 1;
            transform: rotate(2deg) translate(0, -3px);
          }
        `,
      }}
    />
  );
}
