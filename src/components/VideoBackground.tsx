import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import GradualBlur from "@/components/GradualBlur";
import { useIsMobile } from "@/hooks/use-mobile";
import { toMediaSrc, toProxiedMediaSrc } from "@/lib/mediaUrl";

interface VideoBackgroundProps {
  videoUrl?: string;
}

export default function VideoBackground({ videoUrl }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useIsMobile();
  const [muted, setMuted] = useState(true);
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 1000,
  );
  const [videoFailed, setVideoFailed] = useState(false);
  const [useProxySrc, setUseProxySrc] = useState(false);
  const [preferLiteMedia, setPreferLiteMedia] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const connection = (navigator as any).connection;
    if (!connection) return;
    const effectiveType = String(connection.effectiveType ?? "").toLowerCase();
    const shouldUseLite = Boolean(connection.saveData) || effectiveType.includes("2g") || effectiveType.includes("3g");
    setPreferLiteMedia(shouldUseLite);
  }, []);

  // Fade opacity: 0.9 at top, transition to 0.4 around leaderboard
  const opacity = useTransform(scrollY, [0, 300, viewportHeight * 1.5], [0.85, 0.85, 0.50]);
  const topRevealOpacity = useTransform(scrollY, [0, 240, 900], [0.5, 0.75, 0.9]);
  const bottomRevealOpacity = useTransform(scrollY, [0, 240, 900], [0.45, 0.72, 0.88]);

  const toggleMute = () => {
    setMuted((m) => {
      if (videoRef.current) videoRef.current.muted = !m;
      return !m;
    });
  };

  // Default cinematic fallback video
  const rawSrc = videoUrl || "https://res.cloudinary.com/dazvcuqb2/video/upload/v1771615133/173_535__minecraft_music_but_it_hits_hard_1hour_C418_minecraft_ambiance_music_pqddyz.mp4";
  const directSrc = toMediaSrc(rawSrc);
  const proxySrc = toProxiedMediaSrc(rawSrc);
  const src = useProxySrc ? proxySrc : directSrc;
  const showVideo = !preferLiteMedia && !!src;

  const clearLoadTimeout = () => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  };

  const armLoadTimeout = () => {
    clearLoadTimeout();
    loadTimeoutRef.current = setTimeout(() => {
      if (!useProxySrc && proxySrc) {
        setUseProxySrc(true);
        return;
      }
      setVideoFailed(true);
    }, 5500);
  };

  return (
    <>
      {/* Fixed video layer */}
      <motion.div className="fixed inset-0 z-0 overflow-hidden" style={{ opacity: isMobile ? 0.78 : opacity }}>
        {videoFailed || !showVideo ? (
          <div className="w-full h-full" style={{ background: "linear-gradient(160deg, hsl(var(--brown-deep)), hsl(var(--brown)))" }} />
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={src}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onLoadStart={armLoadTimeout}
            onLoadedData={clearLoadTimeout}
            onError={(event) => {
              clearLoadTimeout();
              if (!useProxySrc && proxySrc) {
                setUseProxySrc(true);
                const video = event.currentTarget;
                video.src = proxySrc;
                video.load();
                return;
              }
              setVideoFailed(true);
            }}
          />
        )}
        {/* Cinematic overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, hsla(221, 6%, 51%, 0.14) 0%, hsla(219, 13%, 51%, 0.08) 40%, hsla(220, 14%, 42%, 0.18) 100%)",
          }}
        />
        {/* Scroll black blur reveal masks */}
        {!isMobile && (
          <>
            <motion.div style={{ opacity: topRevealOpacity }}>
              <GradualBlur
                target="parent"
                position="top"
                height="22vh"
                strength={2.2}
                divCount={6}
                curve="bezier"
                exponential
                opacity={1}
                zIndex={6}
              />
            </motion.div>
            <motion.div style={{ opacity: bottomRevealOpacity }}>
              <GradualBlur
                target="parent"
                position="bottom"
                height="26vh"
                strength={2.4}
                divCount={7}
                curve="bezier"
                exponential
                opacity={1}
                zIndex={6}
              />
            </motion.div>
          </>
        )}
        {/* Global fog radial reveals */}
        <div className="absolute inset-0 pointer-events-none">
          {!isMobile && (
            <>
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
            </>
          )}
        </div>
      </motion.div>

      {/* UI Controls */}
      <div className="fixed top-4 right-3 md:right-4 z-50 flex items-center gap-3 md:gap-5">
        <button
          onClick={() => document.getElementById("leaderboard")?.scrollIntoView({ behavior: "smooth" })}
          className="hidden md:inline text-xs font-cinzel tracking-widest transition-all duration-300 hover:opacity-100 opacity-70"
          style={{ color: "hsl(var(--cream))", fontFamily: "Cinzel, serif", background: "none", border: "none" }}
        >
          LEADERBOARD
        </button>
        <button
          onClick={() => document.getElementById("players")?.scrollIntoView({ behavior: "smooth" })}
          className="hidden md:inline text-xs font-cinzel tracking-widest transition-all duration-300 hover:opacity-100 opacity-70"
          style={{ color: "hsl(var(--cream))", fontFamily: "Cinzel, serif", background: "none", border: "none" }}
        >
          MEET PLAYERS
        </button>
        <Link
          to="/admin/login"
          className="glass-card px-3 md:px-4 py-2 rounded-full text-cream text-xs md:text-sm font-cinzel tracking-widest hover:glow-gold transition-all duration-300"
          style={{ color: "hsl(var(--cream))", fontFamily: "Cinzel, serif" }}
        >
          ADMIN
        </Link>
      </div>

      {/* Sound toggle */}
      <button
        onClick={toggleMute}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 glass-card w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center hover:glow-gold transition-all duration-300"
        style={{ color: "hsl(var(--cream))" }}
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </>
  );
}
