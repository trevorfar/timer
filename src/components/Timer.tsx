"use client";
import { useEffect, useRef, useState } from "react";

interface TimerProps {
  duration: number;
  onRunningChange?: (running: boolean) => void;
  onElapsed?: (seconds: number) => void;
  onEditRequest?: () => void;
}

const formatTime = (secs: number) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
};

const playChime = () => {
  try {
    const ctx = new AudioContext();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.22;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.5);
    });
    setTimeout(() => ctx.close(), 2500);
  } catch {
    /* audio unavailable */
  }
};

const Timer = ({ duration, onRunningChange, onElapsed, onEditRequest }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  // Track a wall-clock deadline rather than counting interval ticks: browsers
  // throttle timers in background tabs, which made the old countdown drift.
  const endAtRef = useRef(0);
  const remainingMsRef = useRef(duration * 1000);
  const shownRef = useRef(duration);
  const onElapsedRef = useRef(onElapsed);

  useEffect(() => {
    onElapsedRef.current = onElapsed;
  });

  useEffect(() => {
    onRunningChange?.(isRunning);
  }, [isRunning, onRunningChange]);

  useEffect(() => {
    if (!isRunning) return;
    const tick = () => {
      const msLeft = Math.max(endAtRef.current - Date.now(), 0);
      const left = Math.ceil(msLeft / 1000);
      const delta = shownRef.current - left;
      if (delta <= 0) return;
      shownRef.current = left;
      setTimeLeft(left);
      onElapsedRef.current?.(delta);
      if (left === 0) {
        remainingMsRef.current = 0;
        setIsRunning(false);
        playChime();
      }
    };
    const id = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [isRunning]);

  useEffect(() => {
    const inProgress = isRunning || (timeLeft > 0 && timeLeft < duration);
    document.title = inProgress
      ? `${isRunning ? "" : "Paused · "}${formatTime(timeLeft)}`
      : "Timer";
  }, [isRunning, timeLeft, duration]);

  const toggle = () => {
    if (timeLeft <= 0) {
      onEditRequest?.();
      return;
    }
    if (isRunning) {
      remainingMsRef.current = Math.max(endAtRef.current - Date.now(), 0);
      setIsRunning(false);
    } else {
      endAtRef.current = Date.now() + remainingMsRef.current;
      setIsRunning(true);
    }
  };

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = duration > 0 ? (1 - timeLeft / duration) * circumference : 0;

  const hint =
    timeLeft <= 0
      ? duration > 0 ? "Done" : "Set time"
      : isRunning
        ? "Pause"
        : timeLeft < duration ? "Resume" : "Start";

  return (
    <button
      className="group relative flex h-[240px] w-[240px] cursor-pointer items-center justify-center rounded-full bg-black/40 transition-[background-color,transform] duration-300 hover:bg-black/55 active:scale-[0.98]"
      onClick={toggle}
      aria-label={`${hint} timer, ${formatTime(timeLeft)} remaining`}
    >
      <svg width="240" height="240" viewBox="0 0 200 200" className="absolute">
        <circle
          cx="100" cy="100" r={radius}
          fill="none" stroke="white" strokeWidth="5" opacity="0.15"
        />
        <circle
          cx="100" cy="100" r={radius}
          fill="none" stroke="white" strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-5xl font-light tabular-nums text-white">
          {formatTime(timeLeft)}
        </span>
        <span
          className={`mt-2 text-[11px] uppercase tracking-[0.25em] text-white/60 transition-opacity duration-300 ${
            isRunning ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          }`}
        >
          {hint}
        </span>
      </div>
    </button>
  );
};

export default Timer;
