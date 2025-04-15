export type PexelApi = VideoInfo & {
    timeStamp?: number;
    shouldAutoplay?: boolean;
  }

export type VideoInfo = {
    videoLink: string | null;
    user: string | null;
    url: string | null;
    id: number | undefined;
    directLink?: string;
}
export type Theme = {
    name: string;
    id: number;
    directLink?: string;
  };