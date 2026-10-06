import type { VideoInfo } from "./types";

const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

type CacheEntry = VideoInfo & { timestamp: number };

export const videoCache = {
  get(id: number): VideoInfo | null {
    if (typeof window === "undefined") return null;
    try {
      const cache: Record<number, CacheEntry> = JSON.parse(
        localStorage.getItem("videoCache") ?? "{}"
      );
      const entry = cache[id];
      if (entry && Date.now() - entry.timestamp < CACHE_EXPIRY) {
        return { videoLink: entry.videoLink, user: entry.user, url: entry.url, image: entry.image };
      }
    } catch {
      /* ignore */
    }
    return null;
  },

  set(id: number, data: VideoInfo) {
    if (typeof window === "undefined") return;
    try {
      const cache: Record<number, CacheEntry> = JSON.parse(
        localStorage.getItem("videoCache") ?? "{}"
      );
      cache[id] = { ...data, timestamp: Date.now() };
      localStorage.setItem("videoCache", JSON.stringify(cache));
    } catch {
      /* ignore */
    }
  },
};
