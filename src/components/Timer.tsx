"use client";
import React from "react";

interface TimerProps {
  time: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  timeLeft: number;
  totalDuration: number;
  isRunning: boolean;
  onStartPause: () => void;
  onReset: () => void;
}

const Timer: React.FC<TimerProps> = ({
  time,
  timeLeft,
  totalDuration,
  onStartPause,
  onReset,
}) => {
  const format = (n: number) => n.toString().padStart(2, "0");
  const formatted = `${format(time.hours)}:${format(time.minutes)}:${format(time.seconds)}`;

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = totalDuration > 0 ? (1 - timeLeft / totalDuration) * circumference : 0;

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={onStartPause}
        className="relative flex items-center justify-center w-[240px] h-[240px] rounded-full bg-black/50 hover:opacity-50"
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
        <span className="text-5xl text-white">{formatted}</span>
      </button>

      <div className="flex gap-4">
        <button onClick={onReset} className="px-4 py-2 bg-gray-700 text-white rounded hover:opacity-75">
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;
