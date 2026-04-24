import axios from "axios";
import type { VideoInfo } from "./types";

export const fetchVideo = async (id: number): Promise<VideoInfo | null> => {
  try {
    const { data } = await axios.get(`https://api.pexels.com/videos/videos/${id}`, {
      headers: { Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY },
    });

    if (!data?.video_files?.length) return null;

    const best =
      data.video_files.find(
        (v: { width: number; file_type: string }) =>
          v.width >= 1920 && v.file_type === "video/mp4"
      ) ?? data.video_files[0];

    return { videoLink: best.link, user: data.user.name, url: data.user.url };
  } catch {
    return null;
  }
};
