import { useState, useRef, useEffect, useMemo } from 'react';

interface TimeParts {
  hours: number;
  minutes: number;
  seconds: number;
}

interface UseTimerOptions {
  onComplete?: () => void;
}

export function useTimer(initialSeconds: number, options: UseTimerOptions = {}) {
  const { onComplete } = options;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const time: TimeParts = useMemo(() => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    return { hours, minutes, seconds };
  }, [timeLeft]);

  const start = () => {
    if (!isRunning) setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = (newSeconds?: number) => {
    const resetTo = newSeconds ?? initialSeconds;
    setTimeLeft(resetTo);
    setIsRunning(false);
  };

  const clearTimerInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearTimerInterval();
            if (onComplete) onComplete();  
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearTimerInterval();
    };
  }, [isRunning, onComplete]);

  return { timeLeft, time, isRunning, start, pause, reset };
}
