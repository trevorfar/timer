"use client";
import { useState } from "react";
import type { Task } from "@/utils/types";
import { formatAccrued } from "@/utils/taskStorage";

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
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/50 z-10">
      <div className="relative bg-black rounded-xl shadow-lg w-[420px] max-h-[80vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white bg-gray-800 rounded-full w-7 h-7 flex items-center justify-center hover:opacity-60 cursor-pointer z-10"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="px-6 pt-5 pb-3">
          <h2 className="text-white text-xl">Tasks</h2>
        </div>

        <div className="flex gap-2 px-6 pb-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="New task..."
            className="flex-1 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
          />
          <input
            value={goalMin}
            onChange={(e) => /^\d*$/.test(e.target.value) && setGoalMin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="min"
            className="w-16 px-2 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 text-center focus:outline-none focus:border-gray-500"
          />
          <button
            onClick={submit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 cursor-pointer"
          >
            Add
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-6 pb-5" style={{ scrollbarGutter: "stable" }}>
          {open.length === 0 && done.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">
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
                className={`bg-gray-900 rounded-lg p-3 border transition-colors ${
                  isActive ? "border-blue-500" : "border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleComplete(task.id)}
                    className="w-5 h-5 rounded border border-gray-600 hover:border-white cursor-pointer flex-shrink-0"
                    aria-label="Mark complete"
                  />
                  <button
                    onClick={() => onSelect(isActive ? null : task.id)}
                    className="flex-1 text-left cursor-pointer min-w-0"
                  >
                    <div className="text-white truncate">{task.title}</div>
                    <div className="text-xs text-gray-400">
                      {formatAccrued(task.accumulatedSeconds)}
                      {task.goalSeconds ? ` / ${formatAccrued(task.goalSeconds)}` : ""}
                      {isActive ? " — active" : ""}
                    </div>
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="text-gray-500 hover:text-red-400 cursor-pointer px-1"
                    aria-label="Delete"
                  >
                    ✕
                  </button>
                </div>
                {task.goalSeconds && (
                  <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {done.length > 0 && (
            <>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-3 mb-1">
                Completed
              </div>
              {done.map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-900/40 rounded-lg p-2 flex items-center gap-2"
                >
                  <button
                    onClick={() => onToggleComplete(task.id)}
                    className="w-5 h-5 rounded border border-blue-500 bg-blue-500 hover:opacity-70 cursor-pointer flex-shrink-0 flex items-center justify-center text-white text-xs"
                    aria-label="Mark incomplete"
                  >
                    ✓
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-400 line-through truncate text-sm">
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatAccrued(task.accumulatedSeconds)}
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="text-gray-600 hover:text-red-400 cursor-pointer px-1"
                    aria-label="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskPopup;
