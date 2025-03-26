import React from "react";
//import { motion } from "framer-motion";

interface ThemePopupProps {
  themes: string[];
  findVid: (theme: string) => void;
  onClose: () => void;
}

const ThemePopup = ({ findVid, themes, onClose }: ThemePopupProps) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/50 z-10">
        <div className="bg-black p-6 rounded-lg shadow-lg relative">
          <button
            className="absolute top-2 right-2 text-white bg-gray-800 rounded-full p-2"
            onClick={onClose}
          >
            ✕
          </button>
          <div className="flex flex-col gap-2">
            {themes.map((theme) => (
              <button key={theme} onClick={() => findVid(theme)} className="bg-gray-700 text-white px-4 py-2 rounded">
                {theme}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

export default ThemePopup;
