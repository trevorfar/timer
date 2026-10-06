"use client";
import { useEffect, useRef, useState } from "react";

// How far past "contain" we're willing to zoom to shrink letterbox bars.
// 1.3 crops at most ~23% of the video along its long edge; anything closer
// to the screen's shape than that is shown fully cropped (no bars at all).
const MAX_ZOOM = 1.3;
const FADE_MS = 1000;

type Layer = { id: number; link: string; ready: boolean; aspect?: number };

interface VideoBackgroundProps {
  link: string | null;
  loop: boolean;
  onEnded: () => void;
}

const lastReadyIndex = (layers: Layer[]) => {
  for (let i = layers.length - 1; i >= 0; i--) if (layers[i].ready) return i;
  return -1;
};

const VideoBackground = ({ link, loop, onEnded }: VideoBackgroundProps) => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [seenLink, setSeenLink] = useState<string | null>(null);
  const [screenAspect, setScreenAspect] = useState(16 / 9);
  const elsRef = useRef(new Map<number, HTMLVideoElement>());
  const sourceIdRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // New link: stack it on top of the last visible video so we can crossfade
  // instead of flashing to black. Half-loaded layers from rapid clicks are dropped.
  if (link !== seenLink) {
    setSeenLink(link);
    setLayers((prev) => {
      const base = prev.filter((l) => l.ready).slice(-1);
      if (!link || base[0]?.link === link) return base;
      const id = Math.max(0, ...prev.map((l) => l.id)) + 1;
      return [...base, { id, link, ready: false }];
    });
  }

  useEffect(() => {
    const update = () => setScreenAspect(window.innerWidth / window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const shown = layers[lastReadyIndex(layers)];
  const ratioFor = (aspect?: number) =>
    aspect ? Math.max(aspect, screenAspect) / Math.min(aspect, screenAspect) : 1;
  const zoomFor = (aspect?: number) => Math.min(ratioFor(aspect), MAX_ZOOM);
  const hasBars = !!shown && ratioFor(shown.aspect) > MAX_ZOOM + 0.01;

  useEffect(() => {
    sourceIdRef.current = shown?.id ?? null;
  }, [shown?.id]);

  // Fill any remaining bars with a blurred, low-res copy of the current frame.
  // Drawing to a tiny canvas is far cheaper than decoding the video twice.
  useEffect(() => {
    if (!hasBars) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const draw = () => {
      const id = sourceIdRef.current;
      const v = id !== null ? elsRef.current.get(id) : undefined;
      if (v && v.readyState >= 2) ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    };
    draw();
    const timer = setInterval(draw, 100);
    return () => clearInterval(timer);
  }, [hasBars]);

  const markReady = (id: number) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ready: true } : l)));
    setTimeout(() => {
      setLayers((prev) => {
        const i = lastReadyIndex(prev);
        return i > 0 ? prev.slice(i) : prev;
      });
    }, FADE_MS);
  };

  const topId = layers[layers.length - 1]?.id;

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        width={48}
        height={27}
        aria-hidden
        className={`absolute inset-0 h-full w-full scale-125 blur-3xl transition-opacity duration-1000 ${
          hasBars ? "opacity-60" : "opacity-0"
        }`}
      />
      {layers.map((layer) => {
        const isTop = layer.id === topId;
        return (
          <video
            key={layer.id}
            ref={(el) => {
              if (el) elsRef.current.set(layer.id, el);
              else elsRef.current.delete(layer.id);
            }}
            src={layer.link}
            autoPlay
            muted
            playsInline
            loop={isTop ? loop : true}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity ease-out ${
              layer.ready ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform: `scale(${zoomFor(layer.aspect)})`,
              transitionDuration: `${FADE_MS}ms`,
            }}
            onLoadedMetadata={(e) => {
              const { videoWidth: w, videoHeight: h } = e.currentTarget;
              if (!w || !h) return;
              setLayers((prev) =>
                prev.map((l) => (l.id === layer.id ? { ...l, aspect: w / h } : l))
              );
            }}
            onLoadedData={() => !layer.ready && markReady(layer.id)}
            onEnded={(e) => {
              // Keep it moving while the next theme loads and crossfades in.
              e.currentTarget.play().catch(() => {});
              if (isTop) onEnded();
            }}
          />
        );
      })}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
    </div>
  );
};

export default VideoBackground;
