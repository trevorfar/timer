"use client";
import { useEffect, useState } from "react";
import type { Theme } from "@/utils/types";
import { videoCache } from "@/utils/videoCache";
import { fetchVideo } from "@/utils/fetch";

interface ThemePopupProps {
  themes: Theme[];
  currentThemeIndex: number;
  defaultThemeIndex: number | null;
  onSelect: (index: number) => void;
  onSetDefault: (index: number) => void;
  onClose: () => void;
}

const ThemePopup = ({
  themes,
  currentThemeIndex,
  defaultThemeIndex,
  onSelect,
  onSetDefault,
  onClose,
}: ThemePopupProps) => {
  const [previews, setPreviews] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    themes.forEach((theme, i) => {
      if (theme.directLink) {
        initial[i] = theme.directLink;
      } else {
        const cached = videoCache.get(theme.id);
        if (cached) initial[i] = cached.videoLink;
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
      setPreviews((prev) => ({ ...prev, [i]: v.videoLink }));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shuffle = () => {
    const candidates = themes.map((_, i) => i).filter((i) => i !== currentThemeIndex);
    onSelect(candidates[Math.floor(Math.random() * candidates.length)]);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/50 z-10">
      <div className="relative bg-black rounded-xl shadow-lg w-[520px] max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white bg-gray-800 rounded-full w-7 h-7 flex items-center justify-center hover:opacity-60 cursor-pointer z-20"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-white text-xl">Themes</h2>
          <button
            onClick={shuffle}
            className="text-white bg-gray-800 rounded-lg px-3 py-1 text-sm hover:opacity-70 cursor-pointer mr-10"
          >
            Shuffle
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-6" style={{ scrollbarGutter: "stable" }}>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((theme, i) => {
              const isCurrent = i === currentThemeIndex;
              const isDefault = i === defaultThemeIndex;
              const preview = previews[i];
              return (
                <div
                  key={`${theme.id}-${theme.directLink ?? ""}`}
                  className={`relative rounded-lg overflow-hidden bg-gray-900 border-2 transition-colors ${
                    isCurrent
                      ? "border-blue-500"
                      : "border-transparent hover:border-gray-600"
                  }`}
                >
                  <button
                    onClick={() => onSelect(i)}
                    className="block w-full aspect-video relative cursor-pointer text-left"
                  >
                    {preview ? (
                      <video
                        src={preview}
                        muted
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-950" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    {isCurrent && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-medium px-2 py-0.5 rounded uppercase tracking-wider">
                        Playing
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 right-10 text-white text-sm truncate drop-shadow">
                      {theme.name}
                    </div>
                  </button>
                  <button
                    onClick={() => onSetDefault(i)}
                    title={isDefault ? "Default theme" : "Pin as default"}
                    aria-label={isDefault ? "Default theme" : "Pin as default"}
                    className={`absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                      isDefault
                        ? "bg-yellow-500 text-black"
                        : "bg-black/60 text-gray-300 hover:bg-black/80 hover:text-yellow-400"
                    }`}
                  >
                    ★
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemePopup;
