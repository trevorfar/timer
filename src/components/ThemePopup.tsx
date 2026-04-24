"use client";
import { useState } from "react";
import type { Theme } from "@/utils/types";

const ITEMS_PER_PAGE = 6;

interface ThemePopupProps {
  themes: Theme[];
  currentThemeIndex: number;
  onSelect: (index: number) => void;
  onSetDefault: () => void;
  onClose: () => void;
}

const ThemePopup = ({
  themes,
  currentThemeIndex,
  onSelect,
  onSetDefault,
  onClose,
}: ThemePopupProps) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(themes.length / ITEMS_PER_PAGE);
  const pageThemes = themes.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const shuffle = () => {
    const candidates = themes.map((_, i) => i).filter((i) => i !== currentThemeIndex);
    onSelect(candidates[Math.floor(Math.random() * candidates.length)]);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/50 z-10">
      <div className="bg-black p-6 rounded-xl shadow-lg relative w-80">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white bg-gray-800 rounded-full w-7 h-7 flex items-center justify-center hover:opacity-60 cursor-pointer"
        >
          ✕
        </button>

        <div className="flex flex-col gap-2 mt-2 mb-4">
          {pageThemes.map((theme, pageIdx) => {
            const globalIdx = (page - 1) * ITEMS_PER_PAGE + pageIdx;
            return (
              <button
                key={`${theme.id}-${theme.directLink ?? ""}`}
                onClick={() => onSelect(globalIdx)}
                className={`bg-gray-800 text-white px-4 py-2 rounded-lg hover:opacity-70 cursor-pointer text-left transition-opacity ${
                  globalIdx === currentThemeIndex ? "ring-2 ring-blue-500" : ""
                }`}
              >
                {theme.name}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onSetDefault}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 cursor-pointer"
          >
            Set as Default
          </button>
          <button
            onClick={shuffle}
            className="w-full py-2 bg-gray-700 text-white rounded-lg hover:opacity-70 cursor-pointer"
          >
            Shuffle
          </button>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 text-white bg-gray-800 rounded disabled:opacity-40 hover:opacity-70 cursor-pointer disabled:cursor-not-allowed"
          >
            ◀ Prev
          </button>
          <span className="text-white text-sm">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 text-white bg-gray-800 rounded disabled:opacity-40 hover:opacity-70 cursor-pointer disabled:cursor-not-allowed"
          >
            Next ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemePopup;
