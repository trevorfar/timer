export type Theme = {
  name: string;
  id: number;
  directLink?: string;
};

export type VideoInfo = {
  videoLink: string;
  user: string;
  url: string;
};

export type Task = {
  id: string;
  title: string;
  goalSeconds?: number;
  accumulatedSeconds: number;
  completedAt?: number;
  createdAt: number;
};
