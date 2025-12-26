import { useEffect, useRef, useCallback } from 'react';
import { useCacheStore } from '../context/store';

/**
 * Minimal SWR-style helper over our Zustand stores.
 * - Returns immediately with current data from the store (passed as `current`).
 * - Always performs a background fetch on mount.
 * - If API result differs from latest store value, updates the store (and re-renders the page).
 * - Updates cache metadata (lastFetched/isRefreshing) in useCacheStore under the given `key`.
 */
export type CacheKey = 'tasks' | 'events' | 'tiles';

export interface UseSWRZParams<T> {
  key: CacheKey;
  current: T; // current reactive slice from a Zustand selector
  getLatest: () => T; // callback to read the latest value from the store (not captured)
  set: (v: T) => void; // setter into the store
  fetcher: () => Promise<T>; // API call that returns the full slice
}

export function useSWRZ<T>({ key, current, getLatest, set, fetcher }: UseSWRZParams<T>) {
  const { setRefreshing, setLastFetched } = useCacheStore();
  const mountedRef = useRef(false);

  const runFetch = useCallback(async () => {
    try {
      console.log(`[useSWRZ] runFetch start key=${key}`);
      setRefreshing(key, true);
      const apiData = await fetcher();
      // Compare against the latest store value at commit time, not the captured one
      const latest = getLatest();
      const latestNorm = normalizeForComparison(key, latest);
      const apiNorm = normalizeForComparison(key, apiData);
      const equal = deepEqual(latestNorm, apiNorm);
      if (!equal) {
        console.log(`[useSWRZ] ${key} changed -> updating store`, {
          latestSize: Array.isArray(latest) ? latest.length : typeof latest,
          apiSize: Array.isArray(apiData) ? apiData.length : typeof apiData,
        });
        set(apiData);
      } else {
        console.log(`[useSWRZ] ${key} unchanged -> no store update`);
      }
      setLastFetched(key);
    } catch (e) {
      // Swallow errors; keep showing cached data
      console.error(`[useSWRZ] ${key} fetch error`, e);
    } finally {
      setRefreshing(key, false);
      console.log(`[useSWRZ] runFetch end key=${key}`);
    }
  }, [key, fetcher, getLatest, set, setRefreshing, setLastFetched]);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    // Always verify with API in the background on first mount
    console.log(`[useSWRZ] initial verify key=${key}`);
    void runFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(async () => {
    console.log(`[useSWRZ] manual refresh key=${key}`);
    await runFetch();
  }, [runFetch]);

  return { data: current, refresh } as const;
}

// Normalize payload for comparison to ignore order-only diffs for certain keys
function normalizeForComparison(key: CacheKey, data: any): any {
  if (key !== 'tiles') return data;
  try {
    if (!Array.isArray(data)) return data;
    // Sort by UniqueId then Name to make ordering deterministic
    const copy = [...data].sort((a, b) => {
      const au = (a && a.UniqueId) || '';
      const bu = (b && b.UniqueId) || '';
      if (au && bu && au !== bu) return au.localeCompare(bu);
      const an = (a && a.Name) || '';
      const bn = (b && b.Name) || '';
      return an.localeCompare(bn);
    });
    return copy;
  } catch {
    return data;
  }
}

// Simple deepEqual using JSON for our list payloads (safe for our use-cases)
function deepEqual(a: any, b: any): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}

