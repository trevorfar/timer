"use client";
import { PexelApi } from "@/utils/fetch";
import { defaultVideoCache } from "@/utils/videoCache";
import React, { useState } from "react";

type Theme = {
  name: string;
  id: number;
  directLink?: string;
};

interface ThemePopupProps {
  themes: Theme[];
  findVid: (query: number | string) => void; // Updated to accept string for direct links
  onClose: () => void;
  currentVideo: PexelApi;
}

const ITEMS = 6;

const ThemePopup = ({ findVid, themes, onClose, currentVideo }: ThemePopupProps) => {
  const handleSetDefault = () => {
    if (currentVideo.videoLink) {
      defaultVideoCache.set({
        ...currentVideo,
        shouldAutoplay: true 
      });
    }
  };
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedThemeId, setSelectedThemeId] = useState<number | string | null>(null);

  const handleThemeClick = (theme: Theme) => {
    if (theme.directLink && theme.directLink !== selectedThemeId) {
      setSelectedThemeId(theme.directLink);
      findVid(theme.directLink); // Pass the direct link string
    } else if (theme.id !== selectedThemeId) {
      setSelectedThemeId(theme.id);
      findVid(theme.id); // Pass the numeric ID as before
    }
  };

  const totalPages = Math.ceil(themes.length / ITEMS);
  const startIndex = (currentPage - 1) * ITEMS;
  const paginatedThemes = themes.slice(startIndex, startIndex + ITEMS);

  const shuffleTheme = () => {
    if (themes.length === 0) return;
  
    // Filter out the currently selected theme so we don’t repeat
    const availableThemes = themes.filter((theme) =>
      theme.directLink
        ? theme.directLink !== selectedThemeId
        : theme.id !== selectedThemeId
    );
  
    const randomIndex = Math.floor(Math.random() * availableThemes.length);
    const randomTheme = availableThemes[randomIndex];
  
    handleThemeClick(randomTheme);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/50 z-15">
      <div className="bg-black p-6 rounded-lg shadow-lg relative w-80">
        <button
          className="absolute top-2 right-2 text-white bg-gray-800 rounded-2xl p-2 cursor-pointer hover:opacity-50"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          ✕
        </button>
       
        <div className="flex flex-col gap-2 p-4 cursor-pointer">
        
          {paginatedThemes.map((theme) => (
            
            <button
              key={theme.id}
              onClick={() => handleThemeClick(theme)}
              className={`bg-gray-700 text-white px-4 py-2 rounded cursor-pointer hover:opacity-50 ${
                (theme.directLink && selectedThemeId === theme.directLink) || 
                (!theme.directLink && selectedThemeId === theme.id)
                  ? "ring-2 ring-blue-500"
                  : ""
              }`}
            >
              {theme.name}
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center gap-1">
        {currentVideo && (
          <button
            onClick={handleSetDefault}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-500 cursor-pointer"
          >
            Set Current Video as Default
          </button>
          
        )}
        <button onClick={() => shuffleTheme()}className="bg-gray-700 text-white px-4 py-2 rounded cursor-pointer hover:opacity-50 w-2/3 justify-center items-center">
          Shuffle
        </button>
        </div>
        <div className="flex justify-between mt-4">
          <button
            className={`px-3 py-1 text-white bg-gray-800 rounded ${
              currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-700 cursor-pointer"
            }`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ◀ Prev
          </button>
          <span className="text-white">
            {currentPage} / {totalPages}
          </span>

          <button
            className={`px-3 py-1 text-white bg-gray-800 rounded ${
              currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-700 cursor-pointer"
            }`}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemePopup;