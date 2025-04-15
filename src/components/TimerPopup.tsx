"use client";
import React, { ChangeEvent, KeyboardEvent } from "react";
import { useModal } from "@/components/ModalProvider";

type TimeInput = {
  HH: string;
  MM: string;
  SS: string;
};

interface TimerPopupProps {
  time: TimeInput;
  setTime: React.Dispatch<React.SetStateAction<TimeInput>>;
  setDuration: (seconds: number) => void;
  setInputError: (msg: string | null) => void;
  inputError: string | null;
  minutesRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
}

const TimerPopup: React.FC<TimerPopupProps> = ({
  time,
  setTime,
  setDuration,
  setInputError,
  inputError,
  minutesRef,
  onClose,
}) => {
  const { closeModal } = useModal();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^\d{0,2}$/.test(value)) {
      setTime((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submitTime();
      onClose();
    }
  };

  const submitTime = () => {
    const h = parseInt(time.HH) || 0;
    const m = parseInt(time.MM) || 0;
    const s = parseInt(time.SS) || 0;

    if (h > 23 || m > 59 || s > 59) {
      setInputError("Invalid time values. Hours: 0–23, Minutes/Seconds: 0–59");
      return;
    }

    const totalSeconds = h * 3600 + m * 60 + s;
    if (totalSeconds <= 0) {
      setInputError("Duration must be greater than 0");
      return;
    }

    setDuration(totalSeconds);
    closeModal();
    onClose();
    setInputError(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/50 z-10">
      <div className="bg-black p-6 rounded-lg shadow-lg w-[300px]">
        <button
          className=" top-2 right-2 text-white bg-gray-800 rounded-2xl p-2 cursor-pointer hover:opacity-50"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          X
        </button>
        <h2 className="text-white text-lg font-semibold mb-4 text-center ">
          Set Timer
        </h2>
        <div className="flex flex-col items-center gap-4">
          <div className="flex space-x-2">
            {(["HH", "MM", "SS"] as const).map((unit, idx) => (
              <input
                key={unit}
                name={unit}
                value={time[unit]}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={unit}
                className="w-12 text-center border border-gray-400 rounded bg-gray-900 text-white"
                ref={idx === 1 ? minutesRef : null}
                maxLength={2}
              />
            ))}
          </div>
          {inputError && (
            <div className="text-red-500 text-sm">{inputError}</div>
          )}
        </div>

        <button
          onClick={submitTime}
          className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition cursor-pointer"
        >
          Set Timer
        </button>
      </div>
    </div>
  );
};

export default TimerPopup;