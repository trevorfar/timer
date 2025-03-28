"use client";
import React, { useState } from "react";
//import { motion } from "framer-motion";
type Theme = {
  name: string;
  id: number;
};

interface ThemePopupProps {
  themes: Theme[];
  findVid: (theme: number) => void;
  onClose: () => void;
}

const ITEMS = 6;

const ThemePopup = ({ findVid, themes, onClose }: ThemePopupProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(themes.length / ITEMS);
  const startIndex = (currentPage - 1) * ITEMS;
  const paginatedThemes = themes.slice(startIndex, startIndex + ITEMS);

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/50 z-10">
      <div className="bg-black p-6 rounded-lg shadow-lg relative w-80">
        <button
          className="absolute top-2 right-2 text-white bg-gray-800 rounded-2xl p-2 cursor-pointer hover:opacity-50"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="flex flex-col gap-2 p-4 cursor-pointer">
          {paginatedThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => findVid(theme.id)}
              className="bg-gray-700 text-white px-4 py-2 rounded cursor-pointer hover:opacity-50"
            >
              {theme.name}
            </button>
          ))}
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
