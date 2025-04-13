import { useState } from 'react';
import { useTimer } from './useTimer';

interface PomodoroOptions {
  initialWorkMinutes: number;
  initialBreakMinutes: number;
  autoStartBreak?: boolean;
}

export function usePomodoroTimer(options: PomodoroOptions) {
  const {
    initialWorkMinutes,
    initialBreakMinutes,
    autoStartBreak = true,
  } = options;

  const [workDuration, setWorkDuration] = useState(initialWorkMinutes * 60);
  const [breakDuration, setBreakDuration] = useState(initialBreakMinutes * 60);

  const [isBreak, setIsBreak] = useState(false);

  const { timeLeft, time, isRunning, start, pause, reset } = useTimer(workDuration, {
    onComplete: () => {
      if (isBreak) {
        setIsBreak(false);
        reset(workDuration);         
        if (autoStartBreak) start(); 
      } else {
        setIsBreak(true);
        reset(breakDuration);      
        if (autoStartBreak) start(); 
      }
    }
  });

  const startTimer = () => {
    start();
  };

  const pauseTimer = () => {
    pause();
  };

  const resetPomodoro = () => {
    pause();               // stop the timer
    setIsBreak(false);     // reset to work mode
    reset(workDuration);   // reset timer to full work duration
  };

  const updateDurations = (newWorkMinutes: number, newBreakMinutes: number) => {
    const newWorkSec = newWorkMinutes * 60;
    const newBreakSec = newBreakMinutes * 60;
    setWorkDuration(newWorkSec);
    setBreakDuration(newBreakSec);
    if (isBreak) {
      reset(newBreakSec);
    } else {
      reset(newWorkSec);
    }
  };

  const setDuration = (seconds: number) => {
    pause();
    reset(seconds);
  };

  return {
    timeLeft,
    time,         
    isRunning,
    isBreak,
    workDuration,
    breakDuration,
    start: startTimer,
    pause: pauseTimer,
    reset: resetPomodoro,
    setDurations: updateDurations,
    setDuration
    
  };
}
