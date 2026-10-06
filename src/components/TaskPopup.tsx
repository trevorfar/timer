"use client";
import { useState } from "react";
import type { Task } from "@/utils/types";
import { formatAccrued } from "@/utils/taskStorage";
import Modal from "./Modal";

interface TaskPopupProps {
  tasks: Task[];
  activeTaskId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (title: string, goalMinutes: number | undefined) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const TaskPopup = ({
  tasks,
  activeTaskId,
  onSelect,
  onAdd,
  onToggleComplete,
  onDelete,
  onClose,
}: TaskPopupProps) => {
  const [title, setTitle] = useState("");
  const [goalMin, setGoalMin] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    const g = parseInt(goalMin, 10);
    onAdd(title.trim(), Number.isFinite(g) && g > 0 ? g : undefined);
    setTitle("");
    setGoalMin("");
  };

  const open = tasks.filter((t) => !t.completedAt);
  const done = tasks.filter((t) => t.completedAt);

  return (
    <Modal title="Tasks" onClose={onClose}>
      <div className="flex gap-2 px-6 pb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="New task..."
          className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 transition-colors focus:outline-none focus:border-white/40"
        />
        <input
          value={goalMin}
          onChange={(e) => /^\d*$/.test(e.target.value) && setGoalMin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="min"
          inputMode="numeric"
          className="w-16 px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-center transition-colors focus:outline-none focus:border-white/40"
        />
        <button
          onClick={submit}
          className="px-4 py-2 bg-white text-black font-medium rounded-lg transition-opacity hover:opacity-85 cursor-pointer"
        >
          Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-6 pb-5" style={{ scrollbarGutter: "stable" }}>
        {open.length === 0 && done.length === 0 && (
          <p className="text-white/40 text-sm text-center py-8">
            No tasks yet — add one to start tracking study time.
          </p>
        )}

        {open.map((task) => {
          const isActive = task.id === activeTaskId;
          const progress = task.goalSeconds
            ? Math.min(task.accumulatedSeconds / task.goalSeconds, 1)
            : 0;
          return (
            <div
              key={task.id}
              className={`rounded-xl p-3 border transition-colors ${
                isActive ? "bg-white/10 border-white/40" : "bg-white/5 border-transparent hover:bg-white/[0.07]"
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleComplete(task.id)}
                  className="w-5 h-5 rounded-md border border-white/30 transition-colors hover:border-white cursor-pointer flex-shrink-0"
                  aria-label="Mark complete"
                />
                <button
                  onClick={() => onSelect(isActive ? null : task.id)}
                  className="flex-1 text-left cursor-pointer min-w-0"
                >
                  <div className="text-white truncate">{task.title}</div>
                  <div className="text-xs text-white/50 tabular-nums">
                    {formatAccrued(task.accumulatedSeconds)}
                    {task.goalSeconds ? ` / ${formatAccrued(task.goalSeconds)}` : ""}
                    {isActive ? " — active" : ""}
                  </div>
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="text-white/30 transition-colors hover:text-red-400 cursor-pointer px-1"
                  aria-label="Delete"
                >
                  ✕
                </button>
              </div>
              {task.goalSeconds && (
                <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/80 transition-[width] duration-500"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}

        {done.length > 0 && (
          <>
            <div className="text-xs uppercase tracking-wider text-white/40 mt-3 mb-1">
              Completed
            </div>
            {done.map((task) => (
              <div
                key={task.id}
                className="bg-white/[0.03] rounded-xl p-2 flex items-center gap-2"
              >
                <button
                  onClick={() => onToggleComplete(task.id)}
                  className="w-5 h-5 rounded-md bg-white/80 hover:opacity-70 cursor-pointer flex-shrink-0 flex items-center justify-center text-black text-xs"
                  aria-label="Mark incomplete"
                >
                  ✓
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-white/40 line-through truncate text-sm">
                    {task.title}
                  </div>
                  <div className="text-xs text-white/30 tabular-nums">
                    {formatAccrued(task.accumulatedSeconds)}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(task.id)}
                  className="text-white/20 transition-colors hover:text-red-400 cursor-pointer px-1"
                  aria-label="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </Modal>
  );
};

export default TaskPopup;
