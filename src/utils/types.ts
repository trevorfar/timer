export type PexelApi = VideoInfo & {
    timeStamp?: number;
    shouldAutoplay?: boolean;
  }

export type VideoInfo = {
    videoLink: string | null;
    user: string;
    url: string;
    id: number;
    directLink?: string;
}
export type Theme = {
    name: string;
    id: number;
    directLink?: string;
  };