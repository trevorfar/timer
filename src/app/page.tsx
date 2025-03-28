"use client";
import { useState, useEffect, useRef } from "react";
import { fetchVideo } from "@/utils/fetch";
import Timer from "@/components/Timer";
import ThemePopup from "@/components/ThemePopup";
import Footer from "@/components/Footer";
import { videoCache } from "@/utils/videoCache";
type Theme = {
  name: string;
  id: number;
}
const themes: Theme[] = [
  {name: "Highway", id: 31315701},
  {name: "Coastal Cliffs", id: 30457635},
  {name: "Hot Air Balloons", id: 30707440},
  {name: "Orange Sky", id: 30871873},
  {name: "Lighthouse", id: 30685081},
  {name: "Country Road", id: 8965253},
  {name: "Sparkly Water", id: 27592976},
  {name: "Winter Forest", id: 30825914},
  {name: "Fishing Village", id: 30854811}

];

const VideoBackground = () => {
  const [time, setTime] = useState({ hours: "", minutes: "", seconds: "" });
  const [duration, setDuration] = useState<number>(0);
  const [popUp, setPopUp] = useState<boolean>(false);
  const [resetCount, setResetCount] = useState<number>(0);
  const [themePopup, setThemePopup] = useState<boolean>(false);
  const [videoInfo, setVideoInfo] = useState<{
    videoLink: string | null;
    user: string | null;
    url: string | null;
  }>({
    videoLink: null,
    user: null,
    url: null
  });

  const minutesRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (popUp && minutesRef.current) {
      minutesRef.current.focus();
    }
  }, [popUp]);

  const findVid = async (query: number) => {
    
    const cached = videoCache.get(query);
    if (cached) {
      setVideoInfo({
        videoLink: cached.videoLink,
        user: cached.user,
        url: cached.url
      });
      return;
    }
  
    console.log('No cache found, making API request');
    const url = await fetchVideo({ query });
    
    setVideoInfo(url);    
    videoCache.set(query, url);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      setTime((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const h = parseInt(time.hours) || 0;
      const m = parseInt(time.minutes) || 0;
      const s = parseInt(time.seconds) || 0;
      setDuration(h * 3600 + m * 60 + s);
      setPopUp(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <div className="flex-grow relative">
        {videoInfo.videoLink && (
          <>
            <video
              key={videoInfo.videoLink}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover -z-10"
            >
              <source src={`${videoInfo.videoLink ? videoInfo.videoLink : null}`} type="video/mp4" />
            </video>
          </>
        )}

      {popUp && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/50 z-10">
          <div className="bg-black p-6 rounded-lg shadow-lg">
            <div className="flex flex-col items-center gap-4">
              <div className="flex space-x-2">
                {["hours", "minutes", "seconds"].map((unit, idx) => (
                  <input
                    key={unit}
                    type="text"
                    name={unit}
                    value={time[unit as keyof typeof time]}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={unit.toUpperCase()}
                    className="w-12 text-center border rounded"
                    ref={idx === 1 ? minutesRef : null}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => setPopUp(false)}
              className="mt-4 px-4 py-2 bg-gray-800 text-white rounded flex mx-auto"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {themePopup && (
        <ThemePopup findVid={findVid} themes={themes} onClose={() => setThemePopup(false)} />
      )}

      <div className="flex flex-col z-10 top-4 right-4 absolute text-3xl text-white gap-4">
        <button onClick={() => setThemePopup(true)} className="bg-black/50 px-4 py-2 rounded-lg hover:opacity-45 cursor-pointer">
          Theme
        </button>
        <button onClick={() => setPopUp(true)} className="bg-black/50 px-4 py-2 rounded-lg hover:opacity-45 cursor-pointer">
          Time
        </button>
        <button
          onClick={() => {
            setDuration(duration);
            setResetCount((prev) => prev + 1);
          }}
          className="bg-black/50 px-4 py-2 rounded-lg hover:opacity-45 cursor-pointer"
        >
          Reset
        </button>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
          <Timer key={`${duration}-${resetCount}`} duration={duration} />
        </div>
      </div>


      <Footer user ={videoInfo.user} url={videoInfo.url}/>
    </div>
  );
};

export default VideoBackground;
