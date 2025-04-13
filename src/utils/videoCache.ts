import { PexelApi } from "./types";

type CachedVideo = {
  videoLink: string;
  user: string;
  url: string;
  id: number;
  timestamp: number;
};

type VideoCache = {
  [id: number]: CachedVideo;
};

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const videoCache = {
  get cache(): VideoCache {
    if (typeof window !== 'undefined') {
      try {
        const cache = localStorage.getItem('videoCache');
        return cache ? JSON.parse(cache) : {};
      } catch (error) {
        console.error('Error reading cache:', error);
        return {};
      }
    }
    return {};
  },

  get(id: number): CachedVideo | null {
    const item = this.cache[id];
    console.log('Checking cache for ID:', id, 'Found:', item);
    if (item && Date.now() - item.timestamp < CACHE_EXPIRY) {
      return item;
    }
    return null;
  },

  // getByLink(link: string): CachedVideo | null {
  //   const item = this.cache[id];
  //   console.log('Checking cache for ID:', id, 'Found:', item);
  //   if (item && Date.now() - item.timestamp < CACHE_EXPIRY) {
  //     return item;
  //   }
  //   return null;
  // },

  set(id: number, data: PexelApi) {
    if (!data.videoLink || !data.user || !data.url) {
      console.warn('Not caching incomplete data for ID:', id);
      return;
    }

    try {
      const cache = this.cache;
      cache[id] = {
        videoLink: data.videoLink,
        user: data.user,
        url: data.url,
        id: id,
        timestamp: Date.now()
      };
      localStorage.setItem('videoCache', JSON.stringify(cache));
      console.log('Saved to cache. New cache:', cache);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }
};

export const defaultVideoCache = {
    get(): PexelApi | null {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('defaultVideo');
        return cached ? JSON.parse(cached) : null;
      }
      return null;
    },
  
    set(data: PexelApi) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('defaultVideo', JSON.stringify(data));
      }
    },
  
    clear() {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('defaultVideo');
      }
    }
  };