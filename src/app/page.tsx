"use client";
import ThemePopup from '@/components/ThemePopup';
import Timer from '@/components/Timer';
import TimerPopup from '@/components/TimerPopup';
import { usePomodoroTimer } from '@/hooks/usePomodoro';
import { useVideoManager } from '@/hooks/useVideoManager';
import { themes } from '@/utils/themes';
import React, {  useRef, useState } from 'react';

const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

const VideoBackground: React.FC = () => {
  const {
    time, isRunning,
    start, pause, reset: resetPomodoro,
    setDuration, timeLeft, isBreak, breakDuration, workDuration
  } = usePomodoroTimer({
    initialWorkMinutes: DEFAULT_WORK_MINUTES,
    initialBreakMinutes: DEFAULT_BREAK_MINUTES,
    autoStartBreak: true
  });

  const {
    currentTheme,
    videoUrl,
    fetchAndSetVideo
  } = useVideoManager();

  const [activeModal, setActiveModal] = useState<null | 'theme' | 'time'>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [timeInput, setTimeInput] = useState({ HH: "", MM: "", SS: "" });
  const minutesRef = useRef<HTMLInputElement>(null);
  //const videoRef = useRef<HTMLVideoElement | null>(null);



  const openThemeModal = () => setActiveModal('theme');
  const openTimeModal = () => setActiveModal('time');
  const closeModal = () => setActiveModal(null);

  const toggleTimer = () => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  };

  // useEffect(() => {
  //   if (videoUrl && videoRef.current) {
  //     const videoElement = videoRef.current;

  //     const handleCanPlay = () => {
  //       videoElement.play().catch((err) => {
  //         console.error("Error playing video:", err);
  //       });
  //     };

  //     videoElement.addEventListener('canplay', handleCanPlay);

  //     return () => {
  //       videoElement.removeEventListener('canplay', handleCanPlay);
  //     };
  //   }
  // }, [videoUrl]);

  return (
    <div className="video-background-container">
    {videoUrl && (
    <video
    key={videoUrl}
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover -z-10"
    onLoadedMetadata={(e) => {
      e.currentTarget.play().catch(e => console.log('Autoplay error:', e));
    }}
    >
    <source src={`${videoUrl ? videoUrl : null}`} type="video/mp4" />
    </video>

      // <video preload="auto" ref={videoRef} src={videoUrl} key={videoUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover -z-10" />
    )}
      <div className="flex flex-col items-center gap-6 pt-20">
      <Timer
      time={time}
      timeLeft={timeLeft}
      totalDuration={isBreak ? breakDuration : workDuration}
      isRunning={isRunning}
      onStartPause={toggleTimer}
      onReset={resetPomodoro}
    />

        <div className="flex gap-4">
          <button onClick={toggleTimer} className="bg-white px-4 py-2 rounded">
            {isRunning ? "Pause" : "Start"}
          </button>
          <button onClick={resetPomodoro} className="bg-white px-4 py-2 rounded">Reset</button>
          <button onClick={openTimeModal} className="bg-white px-4 py-2 rounded">⏱ Set Time</button>
          <button onClick={openThemeModal} className="bg-white px-4 py-2 rounded">🎬 Change Theme</button>
        </div>
      </div>

      {activeModal === 'theme' && currentTheme && (
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

      {activeModal === 'time' && (
        <TimerPopup
          time={timeInput}
          setTime={setTimeInput}
          setDuration={setDuration}
          setInputError={setInputError}
          inputError={inputError}
          minutesRef={minutesRef}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default VideoBackground;
