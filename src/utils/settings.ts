import { themes } from "./themes";
import type { CycleMode } from "./types";

const DEFAULT_THEME_KEY = "defaultThemeIndex";
const CYCLE_MODE_KEY = "cycleMode";
const CYCLE_MODES: CycleMode[] = ["repeat", "cycle", "shuffle"];

const read = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
};

export const defaultTheme = {
  get(): number | null {
    const raw = read(DEFAULT_THEME_KEY);
    if (raw === null) return null;
    const index = Number(raw);
    return Number.isInteger(index) && index >= 0 && index < themes.length ? index : null;
  },
  set(index: number) {
    write(DEFAULT_THEME_KEY, String(index));
  },
};

export const cycleModeStorage = {
  get(): CycleMode {
    const raw = read(CYCLE_MODE_KEY);
    return CYCLE_MODES.includes(raw as CycleMode) ? (raw as CycleMode) : "cycle";
  },
  set(mode: CycleMode) {
    write(CYCLE_MODE_KEY, mode);
  },
};
