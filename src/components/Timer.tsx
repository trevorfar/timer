"use client";
import React, {useEffect, useRef, useState} from "react";

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
  isRunning,
  onStartPause,
}) => {

  const initialDurationRef = useRef(totalDuration);
  const [isAnimating, setIsAnimating] = useState(true);
  const previousTimeLeftRef = useRef(timeLeft);
  
  useEffect(() => {
    const prev = previousTimeLeftRef.current;
  
    if (timeLeft > prev + 2) {
      setIsAnimating(false); 
      requestAnimationFrame(() => {
        setIsAnimating(true); 
      });
    }
  
    previousTimeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (isRunning && totalDuration > 0) {
      initialDurationRef.current = totalDuration;
    }
  }, [isRunning, totalDuration]);

  const format = (n: number) => n.toString().padStart(2, "0");
  const formatted = `${format(time.hours)}:${format(time.minutes)}:${format(time.seconds)}`;

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const effectiveDuration = initialDurationRef.current;
  const progress =
    effectiveDuration > 0
      ? (1 - timeLeft / effectiveDuration) * circumference
      : 0;

  return (
    <div className="flex flex-col items-center space-y-4 ">
      <button
        onClick={onStartPause}
        className="relative flex items-center justify-center w-[240px] h-[240px] rounded-full bg-black/50 hover:opacity-50"
      >
        <svg width="240" height="240" viewBox="0 0 200 200" className="absolute cursor-pointer">
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
            className={isAnimating ? "transition-all duration-1000 ease-linear" : ""}
            />
        </svg>
        <span className="text-5xl text-white">{formatted}</span>
      </button>
    </div>
  );
};

export default Timer;
