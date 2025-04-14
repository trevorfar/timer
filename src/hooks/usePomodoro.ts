import { useEffect, useState } from 'react';
import { useTimer } from './useTimer';

interface PomodoroOptions {
  initialWorkMinutes: number;
  initialBreakMinutes: number;
  autoStartBreak?: boolean;
  mode?: 'pomodoro' | 'regular';
  userSetSeconds?: number;
}

export function usePomodoroTimer(options: PomodoroOptions) {
  const {
    initialWorkMinutes,
    initialBreakMinutes,
    autoStartBreak = true,
    mode,
    userSetSeconds = 0
  } = options;

  const initialSeconds = mode === 'regular' ? 0 : initialWorkMinutes * 60;

  const [workDuration, setWorkDuration] = useState(initialWorkMinutes * 60);
  const [breakDuration, setBreakDuration] = useState(initialBreakMinutes * 60);
  const [currentDuration, setCurrentDuration] = useState(initialSeconds);
  const [pendingReset, setPendingReset] = useState<number | null>(null);

  useEffect(() => {
    if (pendingReset !== null) {
      reset(pendingReset);
      setPendingReset(null);
    }
  }, [currentDuration]);

  const [isBreak, setIsBreak] = useState(false);

  const { timeLeft, time, isRunning, start, pause, reset } = useTimer(initialSeconds, {
    onComplete: () => {
      if (mode === 'regular') {
        pause(); 
        return;
      }
      if (isBreak) {
        setIsBreak(false);
        setCurrentDuration(workDuration);
        reset(workDuration);         
        if (autoStartBreak) start(); 
      } else {
        setIsBreak(true);
        setCurrentDuration(breakDuration);
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
 
  const resetRegular = () => {
    pause();
    setPendingReset(userSetSeconds);
    setCurrentDuration(userSetSeconds);
    setDuration(userSetSeconds);
  };

  const resetPomodoro = () => {
    pause();          
    setIsBreak(false);    
    setPendingReset(workDuration);
    setCurrentDuration(workDuration); 
    reset(workDuration);   
  };

  const updateDurations = (newWorkMinutes: number, newBreakMinutes: number) => {
    const newWorkSec = newWorkMinutes * 60;
    const newBreakSec = newBreakMinutes * 60;
    setWorkDuration(newWorkSec);
    setBreakDuration(newBreakSec);
    if (isBreak) {
      reset(newBreakSec);
      start();
    } else {
      reset(newWorkSec);
      start();

    }
  };

  const setDuration = (seconds: number) => {
    pause();
    setCurrentDuration(seconds);
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
    resetPomodoro,
    resetRegular,
    setDurations: updateDurations,
    totalDuration: currentDuration,
    setDuration
    
  };
}
