import axios from "axios";

export const fetchVideo = async ({query} : {query: string}) => {
    try {
      const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY
      const response = await axios.get("https://api.pexels.com/videos/search", {
        headers: { Authorization: PEXELS_API_KEY },
        params: { query: query, per_page: 1 }, 
      });

      if (response.data.videos.length > 0) {
        return response.data.videos[0].video_files[0].link
    }
    } catch (error) {
      console.error("Error fetching video:", error);
    }
  };
