"use client";
import Footer from "@/components/Footer";
import ThemePopup from "@/components/ThemePopup";
import Timer from "@/components/Timer";
import TimerPopup from "@/components/TimerPopup";
import { usePomodoroTimer } from "@/hooks/usePomodoro";
import { useVideoManager } from "@/hooks/useVideoManager";
import { themes } from "@/utils/themes";
import React, { useEffect, useRef, useState } from "react";

const DEFAULT_WORK_MINUTES = 0.05;
const DEFAULT_BREAK_MINUTES = 0.1;

const VideoBackground: React.FC = () => {
  const [mode, setMode] = useState<"pomodoro" | "regular">("regular");
  const [userSetSeconds, setUserSetSeconds] = useState(0);

  const {
    time,
    isRunning,
    start,
    pause,
    resetPomodoro,
    resetRegular,
    setDuration,
    timeLeft,

    totalDuration,
  } = usePomodoroTimer({
    initialWorkMinutes: DEFAULT_WORK_MINUTES,
    initialBreakMinutes: DEFAULT_BREAK_MINUTES,
    autoStartBreak: true,
    mode,
    userSetSeconds 
  });

  const { currentTheme, videoUrl, author, authorUrl, fetchAndSetVideo } =
    useVideoManager();

  const [activeModal, setActiveModal] = useState<null | "theme" | "time">(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [timeInput, setTimeInput] = useState({ HH: "", MM: "", SS: "" });
  const minutesRef = useRef<HTMLInputElement>(null);


  const openThemeModal = () => setActiveModal("theme");
  const openTimeModal = () => setActiveModal("time");
  const closeModal = () => setActiveModal(null);

  useEffect(() => {
    if (mode === "regular") {
      setDuration(0);
    } else {
      resetPomodoro(); 
    }
  }, [mode]);

  const toggleTimer = () => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <div className="flex-grow relative">
        {videoUrl && (
          <video
            key={videoUrl}
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
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <Timer
            time={time}
            timeLeft={timeLeft}
            totalDuration={totalDuration}
            isRunning={isRunning}
            onStartPause={toggleTimer}
            onReset={resetPomodoro}
          />
        </div>

        <div className="absolute top-4 right-4 z-10 flex flex-col gap-4 text-white text-xl">
          {!isRunning && 
          (<>
          <button
            onClick={() => {
              setMode(mode === "pomodoro" ? "regular" : "pomodoro");
              resetPomodoro(); 
            }}
            className="bg-black/50 px-4 py-2 rounded-lg hover:opacity-50 cursor-pointer"
          >
            {mode === "pomodoro" ? "Switch to Regular" : "Switch to Pomodoro"}
          </button>
          <button
            onClick={mode == "pomodoro" ? resetPomodoro : resetRegular}
            className="bg-black/50 px-4 py-2 rounded-lg hover:opacity-50 cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={openTimeModal}
            className="bg-black/50 px-4 py-2 rounded-lg hover:opacity-50 cursor-pointer"
          >
            Set Time
          </button>
          <button
            onClick={openThemeModal}
            className="bg-black/50 px-4 py-2 rounded-lg hover:opacity-50 cursor-pointer"
          >
            Change Theme
          </button></>)}
        </div>

        {activeModal === "theme" && currentTheme && (
          <ThemePopup
            currentVideo={currentTheme}
            findVid={(id) => {
              fetchAndSetVideo(id);
              closeModal();
            }}
            themes={themes}
            onClose={closeModal}
          />
        )}

        {activeModal === "time" && (
          <TimerPopup
            time={timeInput}
            setTime={setTimeInput}
            setDuration={
              (seconds) => {
                setUserSetSeconds(seconds); 
                setDuration(seconds);
              }}
            setInputError={setInputError}
            inputError={inputError}
            minutesRef={minutesRef}
            onClose={closeModal}
          />
        )}
      </div>

      <Footer user={author} url={authorUrl} />
    </div>
  );
};

export default VideoBackground;
