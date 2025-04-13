import { PexelApi } from "./types";
import axios from "axios";

export const fetchVideo = async (query: number| string): Promise<PexelApi> => {
  try {
    const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
    const response = await axios.get(
      `https://api.pexels.com/videos/videos/${query}`,
      {
        headers: { Authorization: PEXELS_API_KEY },
      }
    );
    if (
      !response.data ||
      !response.data.video_files ||
      response.data.video_files.length === 0
    ) {
      console.error("No video files found for this ID.");
      return {
        videoLink: null,
        user: "",
        url: "",
        id: 0
      };
    }
    const bestVideo = response.data.video_files.reduce((max: { width: number; }, video: { width: number; }) =>
      video.width > max.width ? video : max
    );
    return {
      videoLink: bestVideo.link,
      user: response.data.user.name,
      url: response.data.user.url,
      id: response.data.id
    }
    
  } catch (error) {
    console.error("Error fetching video:", error);
    return {
      videoLink: null,
      user: "",
      url: "",
      id: 0,
    };
  }
};

