"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Timer from "@/components/Timer";
import ThemePopup from "@/components/ThemePopup";
import TimePopup from "@/components/TimePopup";
import Footer from "@/components/Footer";
import { fetchVideo } from "@/utils/fetch";
import { videoCache, defaultTheme } from "@/utils/videoCache";
import { themes, DEFAULT_THEME_INDEX } from "@/utils/themes";
import type { VideoInfo } from "@/utils/types";

const PLAYS_BEFORE_CYCLE = 5;

export default function App() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(DEFAULT_THEME_INDEX);
  const [playCount, setPlayCount] = useState(0);

  const [duration, setDuration] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [showThemePopup, setShowThemePopup] = useState(false);
  const [showTimePopup, setShowTimePopup] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoDimsRef = useRef<{ w: number; h: number } | null>(null);
  const [useBars, setUseBars] = useState(true);

  const computeFit = useCallback(() => {
    if (!videoDimsRef.current) return;
    const { w, h } = videoDimsRef.current;
    const videoAR = w / h;
    const screenAR = window.innerWidth / window.innerHeight;
    // fillRatio: how much of the screen the video fills in contain mode (1 = perfect fit, 0.8 = 20% bars)
    const fillRatio = Math.min(videoAR, screenAR) / Math.max(videoAR, screenAR);
    setUseBars(fillRatio < 0.8);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    videoDimsRef.current = { w: v.videoWidth, h: v.videoHeight };
    computeFit();
  }, [computeFit]);

  useEffect(() => {
    window.addEventListener("resize", computeFit);
    return () => window.removeEventListener("resize", computeFit);
  }, [computeFit]);

  const loadTheme = useCallback(async (index: number) => {
    const theme = themes[index];
    setCurrentThemeIndex(index);
    setPlayCount(0);

    if (theme.directLink) {
      setVideoInfo({ videoLink: theme.directLink, user: "", url: "" });
      return;
    }

    const cached = videoCache.get(theme.id);
    if (cached) {
      setVideoInfo(cached);
      return;
    }

    const video = await fetchVideo(theme.id);
    if (video) {
      videoCache.set(theme.id, video);
      setVideoInfo(video);
    }
  }, []);

  useEffect(() => {
    const saved = defaultTheme.get();
    loadTheme(saved ?? DEFAULT_THEME_INDEX);
  }, [loadTheme]);

  const handleVideoEnded = useCallback(() => {
    const newCount = playCount + 1;
    if (newCount >= PLAYS_BEFORE_CYCLE) {
      loadTheme((currentThemeIndex + 1) % themes.length);
    } else {
      setPlayCount(newCount);
      videoRef.current?.play();
    }
  }, [playCount, currentThemeIndex, loadTheme]);

  return (
    <div className="relative flex flex-col min-h-screen w-full overflow-hidden">
      {videoInfo?.videoLink && (
        <div className="absolute inset-0 -z-10 bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            key={videoInfo.videoLink}
            autoPlay
            muted
            playsInline
            className={useBars ? "max-w-full max-h-full w-auto h-auto" : "w-full h-full object-cover"}
            onEnded={handleVideoEnded}
            onLoadedMetadata={handleLoadedMetadata}
          >
            <source src={videoInfo.videoLink} type="video/mp4" />
          </video>
        </div>
      )}

      {showTimePopup && (
        <TimePopup
          onSet={setDuration}
          onClose={() => setShowTimePopup(false)}
        />
      )}

      {showThemePopup && (
        <ThemePopup
          themes={themes}
          currentThemeIndex={currentThemeIndex}
          onSelect={(index) => {
            loadTheme(index);
            setShowThemePopup(false);
          }}
          onSetDefault={() => defaultTheme.set(currentThemeIndex)}
          onClose={() => setShowThemePopup(false)}
        />
      )}

      {!isRunning && (
        <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
          <button
            onClick={() => setShowThemePopup(true)}
            className="bg-black/50 text-white text-xl px-4 py-2 rounded-lg hover:opacity-60 cursor-pointer"
          >
            Theme
          </button>
          <button
            onClick={() => setShowTimePopup(true)}
            className="bg-black/50 text-white text-xl px-4 py-2 rounded-lg hover:opacity-60 cursor-pointer"
          >
            Time
          </button>
          <button
            onClick={() => setResetKey((k) => k + 1)}
            className="bg-black/50 text-white text-xl px-4 py-2 rounded-lg hover:opacity-60 cursor-pointer"
          >
            Reset
          </button>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        <Timer
          key={`${duration}-${resetKey}`}
          duration={duration}
          onRunningChange={setIsRunning}
          onEditRequest={() => setShowTimePopup(true)}
        />
      </div>

      <Footer user={videoInfo?.user || null} url={videoInfo?.url || null} />
    </div>
  );
}
