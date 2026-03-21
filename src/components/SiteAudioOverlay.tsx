import { useEffect, useMemo, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { CLOUDINARY_MEDIA } from "@/lib/cloudinaryMedia";

const STORAGE_KEY = "gm-sound-enabled";

export default function SiteAudioOverlay() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  const hasTrack = useMemo(() => CLOUDINARY_MEDIA.soundtrackUrl.trim().length > 0, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const persisted = window.localStorage.getItem(STORAGE_KEY);
    if (persisted === "1") setEnabled(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  }, [enabled]);

  useEffect(() => {
    if (!hasTrack) return;

    const audio = new Audio(CLOUDINARY_MEDIA.soundtrackUrl);
    audio.loop = true;
    audio.preload = "none";
    audio.volume = 0.4;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [hasTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (enabled) {
      void audio.play().catch(() => {
        setEnabled(false);
      });
      return;
    }

    audio.pause();
    audio.currentTime = 0;
  }, [enabled]);

  return (
    <div className="fixed bottom-4 right-4 z-[120] md:bottom-6 md:right-6">
      <button
        type="button"
        onClick={() => setEnabled((prev) => !prev)}
        className="relative w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/30 bg-black/45 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 hover:border-white/70"
        title={hasTrack ? "Toggle soundtrack" : "Add soundtrack URL in src/lib/cloudinaryMedia.ts"}
        aria-label={enabled ? "Sound on" : "Sound off"}
      >
        <span
          className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full"
          style={{
            background: enabled ? "#22c55e" : "#6b7280",
            boxShadow: enabled ? "0 0 10px rgba(34,197,94,0.8)" : "none",
          }}
        />
        {enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
    </div>
  );
}
