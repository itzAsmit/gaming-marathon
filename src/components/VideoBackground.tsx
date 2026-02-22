import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";

interface VideoBackgroundProps {
  videoUrl?: string;
}

export default function VideoBackground({ videoUrl }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const { scrollY } = useScroll();

  // Fade opacity: 0.9 at top, transition to 0.4 around leaderboard
  const opacity = useTransform(scrollY, [0, 300, window.innerHeight * 1.5], [0.85, 0.85, 0.50]);

  const toggleMute = () => {
    setMuted((m) => {
      if (videoRef.current) videoRef.current.muted = !m;
      return !m;
    });
  };

  // Default cinematic fallback video
  const src = videoUrl || "https://res.cloudinary.com/dazvcuqb2/video/upload/v1771615133/173_535__minecraft_music_but_it_hits_hard_1hour_C418_minecraft_ambiance_music_pqddyz.mp4";

  return (
    <>
      {/* Fixed video layer */}
      <motion.div className="fixed inset-0 z-0 overflow-hidden" style={{ opacity }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={src}
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Cinematic overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, hsla(var(--brown-deep) / 0.28) 0%, hsla(var(--brown-deep) / 0.16) 40%, hsla(var(--brown-deep) / 0.32) 100%)",
          }}
        />
      </motion.div>

      {/* UI Controls */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-3xl">
        <div className="glass-card rounded-full px-3 py-2 md:px-5 md:py-2.5 flex items-center justify-center gap-2 md:gap-5 flex-wrap">
        <button
          onClick={() => document.getElementById("leaderboard")?.scrollIntoView({ behavior: "smooth" })}
          className="text-[10px] md:text-xs font-cinzel tracking-[0.22em] md:tracking-widest transition-all duration-300 hover:opacity-100 opacity-80 px-2 py-1"
          style={{ color: "hsl(var(--cream))", fontFamily: "Cinzel, serif", background: "none", border: "none" }}
        >
          LEADERBOARD
        </button>
        <button
          onClick={() => document.getElementById("players")?.scrollIntoView({ behavior: "smooth" })}
          className="text-[10px] md:text-xs font-cinzel tracking-[0.22em] md:tracking-widest transition-all duration-300 hover:opacity-100 opacity-80 px-2 py-1"
          style={{ color: "hsl(var(--cream))", fontFamily: "Cinzel, serif", background: "none", border: "none" }}
        >
          MEET PLAYERS
        </button>
        <Link
          to="/admin/login"
          className="px-4 md:px-5 py-1.5 md:py-2 rounded-full text-cream text-xs md:text-sm font-cinzel tracking-[0.22em] md:tracking-widest hover:glow-gold transition-all duration-300 border"
          style={{ color: "hsl(var(--cream))", fontFamily: "Cinzel, serif" }}
        >
          ADMIN
        </Link>
      </div>
      </div>

      {/* Sound toggle */}
      <button
        onClick={toggleMute}
        className="fixed bottom-6 right-6 z-50 glass-card w-12 h-12 rounded-full flex items-center justify-center hover:glow-gold transition-all duration-300"
        style={{ color: "hsl(var(--cream))" }}
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </>
  );
}
