"use client"
import {  useState } from "react";
import { fetchVideo } from "@/utils/fetch";


const VideoBackground = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  async function findVid() {
    const query = "nature"
    const videoUrl = await fetchVideo({query})
    setVideoUrl(videoUrl)
  }

  return (
    <div className="absolute inset-0 w-full h-full z-[-1] overflow-hidden">
      {videoUrl && (
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}
    <button onClick={() => findVid()} className="text-4xl text-white"> CLICK ME </button>

    </div>
  );
};

export default VideoBackground;
