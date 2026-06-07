"use client";

import { useCallback, useEffect, useRef } from "react";
import type { QueryClient, QueryKey } from "@tanstack/react-query";

export const PREFETCH_STALE_TIME_MS = 5 * 60 * 1000;
export const PREFETCH_INTENT_DELAY_MS = 100;

export function isQueryFresh(
  queryClient: QueryClient,
  queryKey: QueryKey,
  staleTimeMs = PREFETCH_STALE_TIME_MS,
) {
  const state = queryClient.getQueryState(queryKey);

  return Boolean(
    state?.data && Date.now() - state.dataUpdatedAt < staleTimeMs,
  );
}

type UseIntentPrefetchOptions = {
  id: string;
  prefetchedIds: Set<string>;
  prefetch: () => Promise<void> | void;
  delayMs?: number;
};

export function useIntentPrefetch({
  id,
  prefetchedIds,
  prefetch,
  delayMs = PREFETCH_INTENT_DELAY_MS,
}: UseIntentPrefetchOptions) {
  const timerRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);

  const cancelPrefetch = useCallback(() => {
    if (!timerRef.current) {
      return;
    }

    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const runPrefetch = useCallback(() => {
    if (!id || prefetchedIds.has(id) || inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;

    Promise.resolve(prefetch())
      .then(() => {
        prefetchedIds.add(id);
      })
      .catch(() => {
        prefetchedIds.delete(id);
      })
      .finally(() => {
        inFlightRef.current = false;
      });
  }, [id, prefetch, prefetchedIds]);

  const schedulePrefetch = useCallback(() => {
    if (!id || timerRef.current || prefetchedIds.has(id)) {
      return;
    }

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      runPrefetch();
    }, delayMs);
  }, [delayMs, id, prefetchedIds, runPrefetch]);

  useEffect(() => cancelPrefetch, [cancelPrefetch]);

  return {
    onMouseEnter: schedulePrefetch,
    onFocus: schedulePrefetch,
    onTouchStart: schedulePrefetch,
    onMouseLeave: cancelPrefetch,
  };
}
