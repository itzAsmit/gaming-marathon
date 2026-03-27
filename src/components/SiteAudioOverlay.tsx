import { useEffect, useMemo, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { SITE_MEDIA } from "@/lib/siteMedia";

const STORAGE_KEY = "gm-sound-enabled";

export default function SiteAudioOverlay() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  const hasTrack = useMemo(() => SITE_MEDIA.soundtrackUrl.trim().length > 0, []);

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

    const audio = new Audio(SITE_MEDIA.soundtrackUrl);
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
        className="relative w-12 h-12 md:w-14 md:h-14 rounded-full border border-black/20 bg-white/85 backdrop-blur-sm text-black flex items-center justify-center transition-all duration-200 hover:border-black/45 hover:bg-white"
        title={hasTrack ? "Toggle soundtrack" : "Add soundtrack path in src/lib/siteMedia.ts"}
        aria-label={enabled ? "Sound on" : "Sound off"}
      >
        {enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
    </div>
  );
}
