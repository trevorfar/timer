"use client";
import { useEffect, useRef, useState } from "react";

interface TimePopupProps {
  onSet: (seconds: number) => void;
  onClose: () => void;
}

const TimePopup = ({ onSet, onClose }: TimePopupProps) => {
  const [time, setTime] = useState({ HH: "", MM: "", SS: "" });
  const [error, setError] = useState<string | null>(null);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => { firstRef.current?.focus(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!/^\d*$/.test(value)) return;
    const n = parseInt(value, 10) || 0;
    if (name === "HH" && n > 23) { setError("Hours must be 0–23"); return; }
    if ((name === "MM" || name === "SS") && n > 59) { setError("Minutes/seconds must be 0–59"); return; }
    setTime((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const submit = () => {
    const h = parseInt(time.HH, 10) || 0;
    const m = parseInt(time.MM, 10) || 0;
    const s = parseInt(time.SS, 10) || 0;
    onSet(h * 3600 + m * 60 + s);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/50 z-10">
      <div className="relative bg-black p-6 rounded-xl shadow-lg w-72">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white text-xl hover:text-red-400 cursor-pointer"
        >
          &times;
        </button>
        <div className="flex flex-col items-center gap-4 mt-2">
          <div className="flex gap-3">
            {(["HH", "MM", "SS"] as const).map((unit, i) => (
              <input
                key={unit}
                name={unit}
                value={time[unit]}
                onChange={handleChange}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={unit}
                ref={i === 0 ? firstRef : null}
                maxLength={2}
                className="w-12 text-center border border-gray-600 rounded-lg bg-gray-900 text-white py-2"
              />
            ))}
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={submit}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:opacity-70 cursor-pointer"
          >
            Set Timer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimePopup;
