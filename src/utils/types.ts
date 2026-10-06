export type Theme = {
  name: string;
  id: number;
  directLink?: string;
};

export type VideoInfo = {
  videoLink: string;
  user: string;
  url: string;
  image?: string;
};

// repeat: loop the selected theme forever
// cycle: advance to the next theme after PLAYS_BEFORE_CYCLE plays
// shuffle: jump to a random theme after PLAYS_BEFORE_CYCLE plays
export type CycleMode = "repeat" | "cycle" | "shuffle";

export type Task = {
  id: string;
  title: string;
  goalSeconds?: number;
  accumulatedSeconds: number;
  completedAt?: number;
  createdAt: number;
};
