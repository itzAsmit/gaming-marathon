import { useEffect, useMemo, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import ReactPlayer from "react-player";
import { SITE_MEDIA } from "@/lib/siteMedia";

const STORAGE_KEY = "gm-sound-enabled";

export default function SiteAudioOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const hasTrack = useMemo(() => SITE_MEDIA.soundtrackUrl.trim().length > 0, []);

  // Check for saved preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const persisted = window.localStorage.getItem(STORAGE_KEY);
    if (persisted === "1") {
      setEnabled(true);
    }
  }, []);

  // Required to unlock autoplay policies in some browsers
  useEffect(() => {
    const unlockAudio = () => {
      setHasInteracted(true);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  }, [enabled]);

  const toggleSound = () => {
    setHasInteracted(true);
    setEnabled((prev) => !prev);
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[120] md:bottom-6 md:right-6">
        <button
          type="button"
          onClick={toggleSound}
          className="relative w-12 h-12 md:w-14 md:h-14 rounded-full border border-black/20 bg-white/85 backdrop-blur-sm text-black flex items-center justify-center transition-all duration-200 hover:border-black/45 hover:bg-white"
          title={hasTrack ? "Toggle soundtrack" : "Add YouTube link or audio path in src/lib/siteMedia.ts"}
          aria-label={enabled ? "Sound on" : "Sound off"}
        >
          {enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      {hasTrack && (
        <div className="hidden">
          <ReactPlayer
            url={SITE_MEDIA.soundtrackUrl}
            playing={enabled && hasInteracted}
            loop={true}
            volume={0.4}
            width="0"
            height="0"
            playsinline={true}
            config={{
              youtube: {
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  disablekb: 1,
                  fs: 0,
                  modestbranding: 1,
                  iv_load_policy: 3
                }
              }
            }}
          />
        </div>
      )}
    </>
  );
}
