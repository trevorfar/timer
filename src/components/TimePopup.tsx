"use client";
import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";

const PRESET_MINUTES = [5, 15, 25, 45, 60];

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

  const total =
    (parseInt(time.HH, 10) || 0) * 3600 +
    (parseInt(time.MM, 10) || 0) * 60 +
    (parseInt(time.SS, 10) || 0);

  const apply = (seconds: number) => {
    if (seconds <= 0) { setError("Enter a time greater than zero"); return; }
    onSet(seconds);
    onClose();
  };

  return (
    <Modal title="Set timer" onClose={onClose} className="max-w-sm">
      <div className="flex flex-col gap-5 px-6 pb-6">
        <div className="grid grid-cols-5 gap-2">
          {PRESET_MINUTES.map((m) => (
            <button
              key={m}
              onClick={() => apply(m * 60)}
              className="cursor-pointer rounded-lg bg-white/5 py-2 text-sm text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              {m}m
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-white/40">
          {(["HH", "MM", "SS"] as const).map((unit, i) => (
            <div key={unit} className="flex items-center gap-2">
              {i > 0 && <span className="text-xl">:</span>}
              <input
                name={unit}
                value={time[unit]}
                onChange={handleChange}
                onKeyDown={(e) => e.key === "Enter" && apply(total)}
                placeholder={unit}
                ref={i === 0 ? firstRef : null}
                maxLength={2}
                inputMode="numeric"
                className="w-14 rounded-lg border border-white/10 bg-white/5 py-2 text-center text-xl tabular-nums text-white placeholder-white/30 transition-colors focus:border-white/40 focus:outline-none"
              />
            </div>
          ))}
        </div>

        {error && <p className="-mt-2 text-center text-sm text-red-400">{error}</p>}

        <button
          onClick={() => apply(total)}
          className="cursor-pointer rounded-lg bg-white py-2 font-medium text-black transition-opacity hover:opacity-85"
        >
          Set timer
        </button>
      </div>
    </Modal>
  );
};

export default TimePopup;
