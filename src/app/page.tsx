"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Timer from "@/components/Timer";
import ThemePopup from "@/components/ThemePopup";
import TimePopup from "@/components/TimePopup";
import TaskPopup from "@/components/TaskPopup";
import VideoBackground from "@/components/VideoBackground";
import Footer from "@/components/Footer";
import { fetchVideo } from "@/utils/fetch";
import { videoCache } from "@/utils/videoCache";
import { defaultTheme, cycleModeStorage } from "@/utils/settings";
import { themes, DEFAULT_THEME_INDEX, PLAYS_BEFORE_CYCLE } from "@/utils/themes";
import { taskStorage, activeTaskStorage, newTaskId } from "@/utils/taskStorage";
import type { VideoInfo, Task, CycleMode } from "@/utils/types";

const controlClass =
  "cursor-pointer rounded-xl bg-black/40 px-4 py-2 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white";

export default function App() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(DEFAULT_THEME_INDEX);
  const [pendingThemeIndex, setPendingThemeIndex] = useState<number | null>(null);
  const [cycleMode, setCycleMode] = useState<CycleMode>("cycle");
  const playCountRef = useRef(0);
  const themeRequestRef = useRef(0);

  const [duration, setDuration] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [showThemePopup, setShowThemePopup] = useState(false);
  const [showTimePopup, setShowTimePopup] = useState(false);
  const [showTaskPopup, setShowTaskPopup] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [defaultThemeIndex, setDefaultThemeIndex] = useState<number | null>(null);
  // State (not a ref) so the persist effects can't run in the same commit as
  // the initial load and overwrite saved tasks with the empty initial array.
  const [storageLoaded, setStorageLoaded] = useState(false);

  const loadTheme = useCallback(async (index: number) => {
    // Ignore responses from older requests so rapid clicks can't land on
    // whichever fetch happened to resolve last.
    const request = ++themeRequestRef.current;
    playCountRef.current = 0;
    const theme = themes[index];
    setPendingThemeIndex(index);

    let video: VideoInfo | null = theme.directLink
      ? { videoLink: theme.directLink, user: "", url: "" }
      : videoCache.get(theme.id);
    if (!video) {
      video = await fetchVideo(theme.id);
      if (video) videoCache.set(theme.id, video);
    }

    if (request !== themeRequestRef.current) return;
    setPendingThemeIndex(null);
    if (!video) return;
    setCurrentThemeIndex(index);
    setVideoInfo(video);
  }, []);

  useEffect(() => {
    const savedDefault = defaultTheme.get();
    setTasks(taskStorage.get());
    setActiveTaskId(activeTaskStorage.get());
    setDefaultThemeIndex(savedDefault);
    setCycleMode(cycleModeStorage.get());
    setStorageLoaded(true);
    loadTheme(savedDefault ?? DEFAULT_THEME_INDEX);
  }, [loadTheme]);

  useEffect(() => {
    if (storageLoaded) taskStorage.set(tasks);
  }, [tasks, storageLoaded]);

  useEffect(() => {
    if (storageLoaded) activeTaskStorage.set(activeTaskId);
  }, [activeTaskId, storageLoaded]);

  const restartTimer = useCallback((seconds: number) => {
    setDuration(seconds);
    setResetKey((k) => k + 1);
  }, []);

  const handleElapsed = useCallback(
    (seconds: number) => {
      if (!activeTaskId) return;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeTaskId
            ? { ...t, accumulatedSeconds: t.accumulatedSeconds + seconds }
            : t
        )
      );
    },
    [activeTaskId]
  );

  const addTask = useCallback(
    (title: string, goalMinutes: number | undefined) => {
      const newTask: Task = {
        id: newTaskId(),
        title,
        goalSeconds: goalMinutes ? goalMinutes * 60 : undefined,
        accumulatedSeconds: 0,
        createdAt: Date.now(),
      };
      setTasks((prev) => [...prev, newTask]);
      if (activeTaskId) return;
      setActiveTaskId(newTask.id);
      if (newTask.goalSeconds) restartTimer(newTask.goalSeconds);
    },
    [activeTaskId, restartTimer]
  );

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completedAt: t.completedAt ? undefined : Date.now() } : t
      )
    );
    setActiveTaskId((prev) => (prev === id ? null : prev));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setActiveTaskId((prev) => (prev === id ? null : prev));
  }, []);

  const selectTask = useCallback(
    (id: string | null) => {
      setActiveTaskId(id);
      if (!id) return;
      const task = tasks.find((t) => t.id === id);
      if (task?.goalSeconds) {
        const remaining = Math.max(task.goalSeconds - task.accumulatedSeconds, 0);
        restartTimer(remaining > 0 ? remaining : task.goalSeconds);
      }
    },
    [tasks, restartTimer]
  );

  const setDefaultThemeIdx = useCallback((index: number) => {
    defaultTheme.set(index);
    setDefaultThemeIndex(index);
  }, []);

  const changeCycleMode = useCallback((mode: CycleMode) => {
    cycleModeStorage.set(mode);
    setCycleMode(mode);
    playCountRef.current = 0;
  }, []);

  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? null;

  const handleVideoEnded = useCallback(() => {
    if (cycleMode === "repeat") return;
    playCountRef.current += 1;
    if (playCountRef.current < PLAYS_BEFORE_CYCLE) return;
    if (cycleMode === "shuffle") {
      const others = themes.map((_, i) => i).filter((i) => i !== currentThemeIndex);
      loadTheme(others[Math.floor(Math.random() * others.length)]);
    } else {
      loadTheme((currentThemeIndex + 1) % themes.length);
    }
  }, [cycleMode, currentThemeIndex, loadTheme]);

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <VideoBackground
        link={videoInfo?.videoLink ?? null}
        loop={cycleMode === "repeat"}
        onEnded={handleVideoEnded}
      />

      {showTimePopup && (
        <TimePopup
          onSet={restartTimer}
          onClose={() => setShowTimePopup(false)}
        />
      )}

      {showThemePopup && (
        <ThemePopup
          themes={themes}
          currentThemeIndex={currentThemeIndex}
          pendingThemeIndex={pendingThemeIndex}
          defaultThemeIndex={defaultThemeIndex}
          cycleMode={cycleMode}
          onSelect={loadTheme}
          onSetDefault={setDefaultThemeIdx}
          onCycleModeChange={changeCycleMode}
          onClose={() => setShowThemePopup(false)}
        />
      )}

      {showTaskPopup && (
        <TaskPopup
          tasks={tasks}
          activeTaskId={activeTaskId}
          onSelect={selectTask}
          onAdd={addTask}
          onToggleComplete={toggleTaskComplete}
          onDelete={deleteTask}
          onClose={() => setShowTaskPopup(false)}
        />
      )}

      <div
        inert={isRunning}
        className={`absolute top-4 right-4 z-10 flex flex-col gap-2 transition-opacity duration-500 ${
          isRunning ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <button onClick={() => setShowTaskPopup(true)} className={controlClass}>Tasks</button>
        <button onClick={() => setShowThemePopup(true)} className={controlClass}>Theme</button>
        <button onClick={() => setShowTimePopup(true)} className={controlClass}>Time</button>
        <button onClick={() => setResetKey((k) => k + 1)} className={controlClass}>Reset</button>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {activeTask && (
            <button
              onClick={() => setShowTaskPopup(true)}
              className="absolute -top-12 left-1/2 max-w-[280px] -translate-x-1/2 cursor-pointer truncate whitespace-nowrap rounded-full bg-black/40 px-4 py-1 text-sm text-white/90 backdrop-blur-sm transition-colors hover:bg-black/60 animate-fade-in"
            >
              Studying: {activeTask.title}
            </button>
          )}
          <Timer
            key={`${duration}-${resetKey}`}
            duration={duration}
            onRunningChange={setIsRunning}
            onElapsed={handleElapsed}
            onEditRequest={() => setShowTimePopup(true)}
          />
        </div>
      </div>

      <Footer user={videoInfo?.user || null} url={videoInfo?.url || null} />
    </div>
  );
}
