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
  const src = videoUrl || "https://res.cloudinary.com/dazvcuqb2/video/upload/v1771799890/1468.0-1739.0_gpau8i.mp4";

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
        {/* Global fog radial reveals */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute -top-20 left-[4%] h-[24rem] w-[24rem] rounded-full blur-3xl"
            animate={{ x: [0, 42, 0], y: [0, -24, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "radial-gradient(circle, hsla(220 22% 86% / 0.16), transparent 68%)" }}
          />
          <motion.div
            className="absolute top-[12%] right-[8%] h-[28rem] w-[28rem] rounded-full blur-3xl"
            animate={{ x: [0, -54, 0], y: [0, 26, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "radial-gradient(circle, hsla(215 26% 78% / 0.14), transparent 70%)" }}
          />
          <motion.div
            className="absolute top-[44%] left-[24%] h-[22rem] w-[22rem] rounded-full blur-3xl"
            animate={{ x: [0, 34, 0], y: [0, -28, 0], scale: [1, 1.12, 1] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "radial-gradient(circle, hsla(228 18% 82% / 0.12), transparent 66%)" }}
          />
          <motion.div
            className="absolute bottom-[10%] right-[16%] h-[26rem] w-[26rem] rounded-full blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1, 1.09, 1] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "radial-gradient(circle, hsla(220 14% 72% / 0.13), transparent 72%)" }}
          />
        </div>
      </motion.div>

      {/* UI Controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-5">
        <button
          onClick={() => document.getElementById("leaderboard")?.scrollIntoView({ behavior: "smooth" })}
          className="text-xs font-cinzel tracking-widest transition-all duration-300 hover:opacity-100 opacity-70"
          style={{ color: "hsl(var(--cream))", fontFamily: "Cinzel, serif", background: "none", border: "none" }}
        >
          LEADERBOARD
        </button>
        <button
          onClick={() => document.getElementById("players")?.scrollIntoView({ behavior: "smooth" })}
          className="text-xs font-cinzel tracking-widest transition-all duration-300 hover:opacity-100 opacity-70"
          style={{ color: "hsl(var(--cream))", fontFamily: "Cinzel, serif", background: "none", border: "none" }}
        >
          MEET PLAYERS
        </button>
        <Link
          to="/admin/login"
          className="glass-card px-4 py-2 rounded-full text-cream text-sm font-cinzel tracking-widest hover:glow-gold transition-all duration-300"
          style={{ color: "hsl(var(--cream))", fontFamily: "Cinzel, serif" }}
        >
          ADMIN
        </Link>
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
