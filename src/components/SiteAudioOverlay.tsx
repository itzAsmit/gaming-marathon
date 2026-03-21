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

  const label = hasTrack
    ? enabled
      ? "SOUND ON"
      : "SOUND OFF"
    : "NO TRACK";

  return (
    <div className="fixed top-4 right-4 z-[120] md:top-6 md:right-6">
      <button
        type="button"
        onClick={() => setEnabled((prev) => !prev)}
        className="site-audio-btn"
        title={hasTrack ? "Toggle soundtrack" : "Add soundtrack URL in src/lib/cloudinaryMedia.ts"}
      >
        {enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        <span>{label}</span>
      </button>
    </div>
  );
}
