"use client";
import { useEffect, useState } from "react";
import type { CycleMode, Theme } from "@/utils/types";
import { videoCache } from "@/utils/videoCache";
import { fetchVideo } from "@/utils/fetch";
import { PLAYS_BEFORE_CYCLE } from "@/utils/themes";
import Modal from "./Modal";

const MODES: { value: CycleMode; label: string; hint: string }[] = [
  { value: "repeat", label: "Loop", hint: "Keep playing the selected theme forever." },
  { value: "cycle", label: "Cycle", hint: `Move to the next theme every ${PLAYS_BEFORE_CYCLE} plays.` },
  { value: "shuffle", label: "Shuffle", hint: `Jump to a random theme every ${PLAYS_BEFORE_CYCLE} plays.` },
];

type Preview = { video: string; image?: string };

interface ThemePopupProps {
  themes: Theme[];
  currentThemeIndex: number;
  pendingThemeIndex: number | null;
  defaultThemeIndex: number | null;
  cycleMode: CycleMode;
  onSelect: (index: number) => void;
  onSetDefault: (index: number) => void;
  onCycleModeChange: (mode: CycleMode) => void;
  onClose: () => void;
}

const ThemePopup = ({
  themes,
  currentThemeIndex,
  pendingThemeIndex,
  defaultThemeIndex,
  cycleMode,
  onSelect,
  onSetDefault,
  onCycleModeChange,
  onClose,
}: ThemePopupProps) => {
  const [previews, setPreviews] = useState<Record<number, Preview>>(() => {
    const initial: Record<number, Preview> = {};
    themes.forEach((theme, i) => {
      if (theme.directLink) {
        initial[i] = { video: theme.directLink };
      } else {
        const cached = videoCache.get(theme.id);
        if (cached) initial[i] = { video: cached.videoLink, image: cached.image };
      }
    });
    return initial;
  });

  useEffect(() => {
    let cancelled = false;
    themes.forEach(async (theme, i) => {
      if (theme.directLink) return;
      if (previews[i]) return;
      const v = await fetchVideo(theme.id);
      if (cancelled || !v) return;
      videoCache.set(theme.id, v);
      setPreviews((prev) => ({ ...prev, [i]: { video: v.videoLink, image: v.image } }));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const random = () => {
    const candidates = themes.map((_, i) => i).filter((i) => i !== currentThemeIndex);
    onSelect(candidates[Math.floor(Math.random() * candidates.length)]);
  };

  const activeMode = MODES.find((m) => m.value === cycleMode) ?? MODES[1];

  return (
    <Modal
      title="Themes"
      onClose={onClose}
      className="max-w-xl"
      actions={
        <button
          onClick={random}
          className="cursor-pointer rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/15 hover:text-white"
        >
          Random
        </button>
      }
    >
      <div className="px-6 pb-4">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-white/5 p-1" role="radiogroup" aria-label="Theme playback">
          {MODES.map((mode) => {
            const active = mode.value === cycleMode;
            return (
              <button
                key={mode.value}
                role="radio"
                aria-checked={active}
                onClick={() => onCycleModeChange(mode.value)}
                className={`cursor-pointer rounded-lg py-1.5 text-sm transition-colors ${
                  active ? "bg-white text-black" : "text-white/70 hover:text-white"
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-white/50">{activeMode.hint}</p>
      </div>

      <div className="overflow-y-auto px-6 pb-6" style={{ scrollbarGutter: "stable" }}>
        <div className="grid grid-cols-2 gap-3">
          {themes.map((theme, i) => {
            const isCurrent = i === currentThemeIndex;
            const isPending = i === pendingThemeIndex;
            const isDefault = i === defaultThemeIndex;
            const preview = previews[i];
            return (
              <div
                key={`${theme.id}-${theme.directLink ?? ""}`}
                className={`group relative overflow-hidden rounded-xl bg-white/5 ring-2 transition-[box-shadow] duration-200 ${
                  isCurrent ? "ring-white" : "ring-transparent hover:ring-white/30"
                }`}
              >
                <button
                  onClick={() => onSelect(i)}
                  onMouseEnter={(e) => e.currentTarget.querySelector("video")?.play().catch(() => {})}
                  onMouseLeave={(e) => e.currentTarget.querySelector("video")?.pause()}
                  className="relative block aspect-video w-full cursor-pointer text-left focus-visible:outline-none"
                >
                  {preview ? (
                    <video
                      src={preview.image ? preview.video : `${preview.video}#t=1`}
                      poster={preview.image}
                      muted
                      loop
                      playsInline
                      preload={preview.image ? "none" : "metadata"}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/10 to-white/0" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  {(isCurrent || isPending) && (
                    <div className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
                      {isPending ? "Loading…" : "Playing"}
                    </div>
                  )}
                  <div className="absolute right-10 bottom-2 left-3 truncate text-sm text-white drop-shadow">
                    {theme.name}
                  </div>
                </button>
                <button
                  onClick={() => onSetDefault(i)}
                  title={isDefault ? "Default theme" : "Set as default"}
                  aria-label={isDefault ? "Default theme" : "Set as default"}
                  className={`absolute right-2 bottom-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-sm transition-colors ${
                    isDefault
                      ? "bg-yellow-400 text-black"
                      : "bg-black/50 text-white/60 hover:bg-black/70 hover:text-yellow-300"
                  }`}
                >
                  ★
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default ThemePopup;
