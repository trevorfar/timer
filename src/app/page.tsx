"use client";
import { useState, useEffect, useRef } from "react";
import { fetchVideo } from "@/utils/fetch";
import Timer from "@/components/Timer";
import ThemePopup from "@/components/ThemePopup";

const themes = ["nature", "lions", "clouds", "ocean"]

const VideoBackground = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [time, setTime] = useState({ hours: "", minutes: "", seconds: "" });
  const [duration, setDuration] = useState<number>(0);
  const [iDuration, setIDuration] = useState<number>(0);
  const [popUp, setPopUp] = useState<boolean>(false);
  const [resetCount, setResetCount] = useState(0);
  const [themePopup, setThemePopup] = useState(0);


  const minutesRef = useRef(null);
  useEffect(() => {
    if (popUp && minutesRef.current) {
      //@ts-expect-error TypeScript BS, it works fine.
      minutesRef.current.focus();

    }
  }, [popUp]);

  useEffect(() => {
    console.log("Updated video URL:", videoUrl);
  }, [videoUrl]);

  async function findVid(query: string) {
    const videoUrl = await fetchVideo({ query });
    console.log(videoUrl)
    setVideoUrl(videoUrl);
  }

    //@ts-expect-error aaa
    const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); 
  
      const { hours, minutes, seconds } = time;
      const h = parseInt(hours) || 0;
      const m = parseInt(minutes) || 0;
      const s = parseInt(seconds) || 0;
      const newDuration = h * 3600 + m * 60 + s;
      setDuration(newDuration);
      setIDuration(newDuration)
      setPopUp(false); 
    }
  };
    //@ts-expect-error aaa
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      setTime((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="relative w-full h-screen">
      {videoUrl && (
        <video
          key={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-10"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {popUp && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/50 z-10">
          <div className="bg-black p-6 rounded-lg shadow-lg">
            <div className="flex flex-col items-center gap-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="hours"
                  value={time.hours}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="HH"
                  className="w-12 text-center border rounded"
                />
                <input
                  type="text"
                  name="minutes"
                  value={time.minutes}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="MM"
                  className="w-12 text-center border rounded"
                  ref={minutesRef}
                />
                <input
                  type="text"
                  name="seconds"
                  value={time.seconds}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown} 
                  placeholder="SS"
                  className="w-12 text-center border rounded"
                />
              </div>
            </div>

            <button
              onClick={() => setPopUp(false)}
              className="mt-4 px-4 py-2 bg-gray-800 text-white rounded items-center justify-center flex mx-auto"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {themePopup !== 0 && <ThemePopup findVid={findVid} themes={themes} onClose={() => setThemePopup(0)}/>}
      <div className="flex flex-col z-10 top-4 right-4 absolute text-4xl text-white gap-4">
        <button onClick={() => setThemePopup(1)} className="bg-black/50 px-4 py-2 rounded-lg">
          Theme
        </button>
        <button
          className="bg-black/50 px-4 py-2 rounded-lg"
          onClick={() => setPopUp((prev) => !prev)}
        >
          Change Time
        </button>
        <button className="bg-black/50 px-4 py-2 rounded-lg"
        onClick={() => {
          setDuration(iDuration)
          setResetCount((prev) => prev + 1)}
        }
        >Reset</button>
      </div>

      <div className="absolute inset-0 flex items-center justify-center ">
        <div className="">
          <Timer key={`${duration}-${resetCount}`} duration={duration} />
        </div>
      </div>
    </div>
  );
};

export default VideoBackground;
