"use client";
import { useState, useEffect, useRef } from "react";
import { fetchVideo, PexelApi } from "@/utils/fetch";
import Timer from "@/components/Timer";
import ThemePopup from "@/components/ThemePopup";
import Footer from "@/components/Footer";
import { defaultVideoCache, videoCache } from "@/utils/videoCache";
import { themes } from "../utils/themes";

const VideoBackground = () => {
  const [time, setTime] = useState({ HH: "", MM: "", SS: "" });
  const [duration, setDuration] = useState<number>(0);
  const [popUp, setPopUp] = useState<boolean>(false);
  const [resetCount, setResetCount] = useState<number>(0);
  const [themePopup, setThemePopup] = useState<boolean>(false);
  const [currentVideo, setCurrentVideo] = useState<PexelApi>({
    videoLink: "",
    user: "",
    url: "",
  });
  const [inputError, setInputError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [videoInfo, setVideoInfo] = useState<{
    videoLink: string | null;
    user: string | null;
    url: string | null;
    shouldAutoplay?: boolean;
  }>({
    videoLink: null,
    user: null,
    url: null,
    shouldAutoplay: false,
  });

  const minutesRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const cachedDefaultVideo = defaultVideoCache.get();
    if (cachedDefaultVideo) {
      setVideoInfo(cachedDefaultVideo);
      setCurrentVideo(cachedDefaultVideo);
      const timer = setTimeout(() => {
        const videoElement = document.querySelector("video");
        if (videoElement) {
          videoElement.muted = true;
          videoElement
            .play()
            .catch((error) => console.log("Autoplay prevented:", error));
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setVideoInfo({
        videoLink:
          "https://videos.pexels.com/video-files/10024586/10024586-uhd_3242_2160_24fps.mp4",
        user: "taro",
        url: "https://www.pexels.com/@taro-raptus/",
        shouldAutoplay: true,
      });
    }
  }, []);

  // Focus on input when popup is open
  useEffect(() => {
    if (popUp && minutesRef.current) {
      minutesRef.current.focus();
    }
  }, [popUp]);

  // Fetch video based on theme or query
  const findVid = async (query: number | string) => {
    if (typeof query === "string") {
      setVideoInfo({
        videoLink: query,
        user: "Trevor Farias",
        url: "https://archive.org/details/@trevorof",
      });
      setCurrentVideo({
        videoLink: query,
        user: "Trevor Farias",
        url: "https://archive.org/details/@trevorof",
      });
      return;
    }

    const cached = videoCache.get(query);
    if (cached) {
      setVideoInfo({
        videoLink: cached.videoLink,
        user: cached.user,
        url: cached.url,
      });
      setCurrentVideo(cached);
      return;
    }

    console.log("No cache found, making API request");
    const video = await fetchVideo({ query });

    setVideoInfo(video);
    videoCache.set(query, video);
    setCurrentVideo(video);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      const numValue = parseInt(value) || 0;
      let isValid = true;
      if (name === "HH" && numValue > 23) isValid = false;
      if (name === "MM" && numValue > 59) isValid = false;
      if (name === "SS" && numValue > 59) isValid = false;

      if (isValid) {
        setTime((prev) => ({ ...prev, [name]: value }));
        setInputError(null);
      } else {
        setInputError(
          name === "HH"
            ? "Hours must be between 0-23"
            : "Minutes/Seconds must be between 0-59"
        );
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const h = parseInt(time.HH) || 0;
      const m = parseInt(time.MM) || 0;
      const s = parseInt(time.SS) || 0;

      if (h > 23 || m > 59 || s > 59) {
        setInputError(
          "Invalid time values. Hours: 0-23, Minutes/Seconds: 0-59"
        );
        return;
      }

      setDuration(h * 3600 + m * 60 + s);
      setPopUp(false);
      setInputError(null);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <div className="flex-grow relative">
        {videoInfo.videoLink && (
          <video
            key={videoInfo.videoLink}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover -z-10"
            onLoadedMetadata={(e) => {
              e.currentTarget
                .play()
                .catch((e) => console.log("Autoplay error:", e));
            }}
          >
            <source src={videoInfo.videoLink} type="video/mp4" />
          </video>
        )}

        {popUp && (
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/50 z-10">
            <div className="relative bg-black p-6 rounded-lg shadow-lg w-[300px]">
              <button
                onClick={() => setPopUp(false)}
                className="absolute top-2 right-2 text-white text-xl hover:text-red-500 transition cursor-pointer"
                aria-label="Close"
              >
                &times;
              </button>

              <div className="flex flex-col items-center gap-4">
                <div className="flex space-x-2">
                  {(["HH", "MM", "SS"] as const).map((unit, idx) => (
                    <div
                      key={unit}
                      className="flex flex-col items-center space-y-2"
                    >
                      <input
                        name={unit}
                        value={time[unit]}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder={unit}
                        className="w-12 text-center border border-gray-400 rounded bg-gray-900 text-white select-none cursor-ns-resize transition-transform duration-150"
                        ref={idx === 1 ? minutesRef : null}
                        maxLength={2}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const startY = e.clientY;
                          const initialValue = parseInt(time[unit]) || 0;
                          const max = unit === "HH" ? 23 : 59;
                          const min = 0;
                          const inputEl = e.currentTarget;
                        
                          const STEP_PX = 5; // controls sensitivity: 5px per value change
                          const MAX_DRAG = 40; // visual limit only
                        
                          let currentVisualOffset = 0;
                        
                          const handleMouseMove = (e: MouseEvent) => {
                            const dragY = e.clientY - startY;
                            const deltaSteps = Math.floor(-dragY / STEP_PX); // dragging up = increase
                            let newValue = initialValue + deltaSteps;
                        
                            // Clamp value to valid bounds (not visual)
                            newValue = Math.max(min, Math.min(max, newValue));
                            setTime((prev) => ({
                              ...prev,
                              [unit]: newValue.toString().padStart(2, "0"),
                            }));
                        
                            // Clamp visual movement only
                            currentVisualOffset = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, dragY));
                            inputEl.style.transform = `translateY(${currentVisualOffset}px)`;
                          };
                        
                          const handleMouseUp = () => {
                            inputEl.style.transform = ""; // reset to original
                            document.removeEventListener("mousemove", handleMouseMove);
                            document.removeEventListener("mouseup", handleMouseUp);
                          };
                        
                          document.addEventListener("mousemove", handleMouseMove);
                          document.addEventListener("mouseup", handleMouseUp);
                        }}
                        
                        
                      />
                    </div>
                  ))}
                </div>
                {inputError && (
                  <div className="text-red-500 text-sm mt-2">{inputError}</div>
                )}
              </div>

              <button
                onClick={() => {
                  const h = parseInt(time.HH) || 0;
                  const m = parseInt(time.MM) || 0;
                  const s = parseInt(time.SS) || 0;

                  if (h > 23 || m > 59 || s > 59) {
                    setInputError(
                      "Invalid time values. Hours: 0-23, Minutes/Seconds: 0-59"
                    );
                    return;
                  }

                  setDuration(h * 3600 + m * 60 + s);
                  setPopUp(false);
                  setInputError(null);
                }}
                className="mt-4 px-4 py-2 bg-gray-800 text-white rounded flex mx-auto cursor-pointer hover:opacity-50"
              >
                Set Timer
              </button>
            </div>
          </div>
        )}

        {themePopup && (
          <ThemePopup
            findVid={findVid}
            themes={themes}
            onClose={() => setThemePopup(false)}
            currentVideo={currentVideo}
          />
        )}

        {!isRunning && (
          <div className="flex flex-col z-10 top-4 right-4 absolute text-3xl text-white gap-4">
            <button
              onClick={() => setThemePopup(true)}
              className="bg-black/50 px-4 py-2 rounded-lg hover:opacity-45 cursor-pointer"
            >
              Theme
            </button>
            <button
              onClick={() => setPopUp(true)}
              className="bg-black/50 px-4 py-2 rounded-lg hover:opacity-45 cursor-pointer"
            >
              Time
            </button>
            <button
              onClick={() => {
                setDuration(duration);
                setResetCount((prev) => prev + 1);
              }}
              className="bg-black/50 px-4 py-2 rounded-lg hover:opacity-45 cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <Timer
            key={`${duration}-${resetCount}`}
            duration={duration}
            onRunningChange={setIsRunning}
          />
        </div>
      </div>

      <Footer user={videoInfo.user} url={videoInfo.url} />
    </div>
  );
};

export default VideoBackground;
