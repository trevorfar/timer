"use client";
import { useEffect, useState } from "react";

interface TimerProps {
  duration: number;
  onRunningChange?: (running: boolean) => void;
  onEditRequest?: () => void;
}

const Timer = ({ duration, onRunningChange, onEditRequest }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setTimeLeft(duration);
    setIsRunning(false);
  }, [duration]);

  useEffect(() => {
    onRunningChange?.(isRunning);
  }, [isRunning, onRunningChange]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0) setIsRunning(false);
      return;
    }
    const id = setInterval(() => setTimeLeft((prev) => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [isRunning, timeLeft]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = duration > 0 ? (1 - timeLeft / duration) * circumference : 0;

  return (
    <button
      className="relative flex items-center justify-center cursor-pointer w-[240px] h-[240px] rounded-full bg-black/50 hover:opacity-50"
      onClick={() => { if (timeLeft > 0) setIsRunning((prev) => !prev); else onEditRequest?.(); }}
    >
      <svg width="240" height="240" viewBox="0 0 200 200" className="absolute">
        <circle
          cx="100" cy="100" r={radius}
          fill="none" stroke="gray" strokeWidth="6" opacity="0.3"
        />
        <circle
          cx="100" cy="100" r={radius}
          fill="none" stroke="white" strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <p className="text-5xl text-white">{formatTime(timeLeft)}</p>
    </button>
  );
};

export default Timer;
