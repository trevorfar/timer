import { fetchVideo } from "@/utils/fetch";
import { videoCache, defaultVideoCache } from "@/utils/videoCache";
import { useState, useEffect } from "react";
import { themes } from "../utils/themes";
import { Theme, VideoInfo } from "../utils/types";

async function fetchRandomVideo(themes: Theme[]): Promise<VideoInfo> {
  const randomIndex = Math.floor(Math.random() * themes.length);
  const randomTheme = themes[randomIndex];
  return await fetchVideo(randomTheme.id);
}

export function useVideoManager() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  useEffect(() => {
    let cancel = false;

    const loadInitialVideo = async () => {
      try {
        const defaultVideo = defaultVideoCache.get();
        if (defaultVideo) {
          setVideoInfo(defaultVideo);
          return;
        }
        const randomVideo = await fetchRandomVideo(themes);
        if (!cancel) {
          videoCache.set(randomVideo.id, randomVideo);
          setVideoInfo(randomVideo);
        }
      } catch (err) {
        console.error("Error loading initial video:", err);
      }
    };

    if (!videoInfo) {
      loadInitialVideo();
    }

    return () => {
      cancel = true;
    };
  }, [videoInfo]);

  const selectTheme = (video: VideoInfo) => {
    const cached = videoCache.get(video.id);
    if (cached) {
      setVideoInfo(cached);  
      console.log("CACHED: ", cached);
    } else {
      setVideoInfo(video);
      videoCache.set(video.id, video);
      console.log("New video set: ", video);
    }
  };
  
  

  const fetchAndSetVideo = async (idOrLink: number | string) => {
    const cached = typeof idOrLink === "number" ? videoCache.get(idOrLink) : null;
    if (cached) {
      setVideoInfo(cached); 
      console.log("GRABBING FROM CAHCED:", cached);
    } else {
      const data = await fetchVideo(idOrLink);
      videoCache.set(data.id, data);
      setVideoInfo(data);
      console.log("FETCHING FROM PEXELS: ", data);
    }
  };
  
  

  return {
    currentTheme: videoInfo,
    videoUrl: videoInfo?.videoLink ?? null,
    author: videoInfo?.user ?? null,
    authorUrl: videoInfo?.url ?? null,
    selectTheme,
    fetchAndSetVideo,
  };
}
