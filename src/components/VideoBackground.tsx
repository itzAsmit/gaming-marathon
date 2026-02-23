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
  const topRevealOpacity = useTransform(scrollY, [0, 240, 900], [0.3, 0.55, 0.72]);
  const bottomRevealOpacity = useTransform(scrollY, [0, 240, 900], [0.22, 0.48, 0.68]);

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
              "linear-gradient(to bottom, hsla(220 18% 78% / 0.14) 0%, hsla(220 14% 70% / 0.08) 40%, hsla(220 18% 74% / 0.18) 100%)",
          }}
        />
        {/* Scroll blur reveal masks */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[22vh] pointer-events-none"
          style={{
            opacity: topRevealOpacity,
            backdropFilter: "blur(9px)",
            WebkitBackdropFilter: "blur(9px)",
            background:
              "radial-gradient(120% 85% at 50% -8%, hsla(220 28% 88% / 0.26), hsla(220 16% 80% / 0.12) 42%, transparent 78%)",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[26vh] pointer-events-none"
          style={{
            opacity: bottomRevealOpacity,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            background:
              "radial-gradient(125% 95% at 50% 115%, hsla(220 26% 84% / 0.24), hsla(220 16% 78% / 0.11) 45%, transparent 78%)",
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
