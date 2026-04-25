import type { Task } from "./types";

const TASKS_KEY = "tasks";
const ACTIVE_TASK_KEY = "activeTaskId";

export const taskStorage = {
  get(): Task[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(TASKS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  set(tasks: Task[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch {
      /* ignore */
    }
  },
};

export const activeTaskStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACTIVE_TASK_KEY);
  },
  set(id: string | null) {
    if (typeof window === "undefined") return;
    if (id === null) localStorage.removeItem(ACTIVE_TASK_KEY);
    else localStorage.setItem(ACTIVE_TASK_KEY, id);
  },
};

export const formatAccrued = (secs: number) => {
  if (secs < 60) return `${secs}s`;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};
