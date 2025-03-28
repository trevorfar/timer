import axios from "axios";

export type PexelApi = {
  videoLink: string | null;
  user: string | null;
  url: string | null;
  timeStamp?: number;
}
export const fetchVideo = async ({ query }: { query: number }): Promise<PexelApi> => {
  try {
    const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
    const response = await axios.get(
      `https://api.pexels.com/videos/videos/${query}`,
      {
        headers: { Authorization: PEXELS_API_KEY },
      }
    );

    console.log("Full API Response:", response.data);

    if (
      !response.data ||
      !response.data.video_files ||
      response.data.video_files.length === 0
    ) {
      console.error("No video files found for this ID.");
      return {
        videoLink: null,
        user: null,
        url: null
      };
    }

   

    const bestVideo = response.data.video_files.reduce((max: { width: number; }, video: { width: number; }) =>
      video.width > max.width ? video : max
    );
    //.data.user.name & url
    return {
      videoLink: bestVideo.link,
      user: response.data.user.name,
      url: response.data.user.url
    }
    
  } catch (error) {
    console.error("Error fetching video:", error);
    return {
      videoLink: null,
      user: null,
      url: null
    };
  }
};
