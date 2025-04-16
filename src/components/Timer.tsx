"use client";
import { useEffect, useState } from "react";

interface TimerProps {
  duration: number;
  onRunningChange?: (running: boolean) => void;
}

const Timer = ({ duration, onRunningChange }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    setTimeLeft(duration);
    setIsRunning(false);
  }, [duration]);

  useEffect(() => {
    // Inform parent of state change
    if (onRunningChange) {
      onRunningChange(isRunning);
    }
  }, [isRunning, onRunningChange]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0){ 
      setIsRunning(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = duration > 0 ? (1 - timeLeft / duration) * circumference : 0;

  return (
    <button
      className="relative flex items-center justify-center cursor-pointer w-[240px] h-[240px] rounded-full bg-black/50 hover:opacity-50"
      onClick={() => timeLeft == 0 ? () => {}: setIsRunning((prev) => !prev)}
    >
      <svg width="240" height="240" viewBox="0 0 200 200" className="absolute">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="gray"
          strokeWidth="6"
          opacity="0.3"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="white"
          strokeWidth="6"
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
