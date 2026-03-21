import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100svh] md:min-h-screen flex items-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,4,8,0.6),rgba(1,4,8,0.85))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:64px_64px] opacity-25" />

      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 md:py-14"
        style={{ y, opacity }}
      >
        <div className="flex items-center justify-between mb-16">
          <p className="text-cinematic text-[0.58rem] sm:text-[0.65rem] text-white/80 tracking-[0.35em]">
            GAMING MARATHON
          </p>
          <div className="hidden md:flex items-center gap-8 text-[0.62rem] text-white/70 tracking-[0.3em] font-semibold">
            <button onClick={() => document.getElementById("leaderboard")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition-colors">RANKINGS</button>
            <button onClick={() => document.getElementById("games")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition-colors">GAMES</button>
            <button onClick={() => document.getElementById("credits")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition-colors">CONTACT</button>
          </div>
          <Link to="/admin/login" className="hidden sm:inline border border-white/30 px-4 py-1.5 text-[0.58rem] tracking-[0.25em] text-white/85 hover:bg-white/10 transition-colors">
            ADMIN
          </Link>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="max-w-4xl">
            <ScrollReveal delay={0.1}>
              <p className="text-[0.62rem] sm:text-xs tracking-[0.5em] text-white/60 mb-7">
                IT IS A LONG ESTABLISHED FACT
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.24}>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-semibold tracking-[0.34em] text-white/92 uppercase pl-[0.34em]">
                GAMING
              </h1>
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-semibold tracking-[0.34em] text-white/92 uppercase pl-[0.34em] mt-2">
                MARATHON
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.36}>
              <p className="max-w-2xl mx-auto mt-7 text-sm sm:text-base text-white/60 tracking-wide">
                11 games, one champion, and zero second chances. Enter the arena and climb to the top.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.48}>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  className="border border-white/55 text-white px-8 py-3 text-[0.62rem] tracking-[0.26em] font-semibold hover:bg-white hover:text-black transition-colors"
                  onClick={() => document.getElementById("players")?.scrollIntoView({ behavior: "smooth" })}
                >
                  JOIN COMPETITION
                </button>
                <button
                  className="border border-white/25 text-white/85 px-8 py-3 text-[0.62rem] tracking-[0.26em] font-semibold hover:border-white/55 transition-colors"
                  onClick={() => window.open("https://discord.gg/VwW8ktwzyb", "_blank")}
                >
                  WATCH COMMUNITY
                </button>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.65}>
            <div className="mt-16 grid grid-cols-3 gap-3 sm:gap-5 max-w-xl mx-auto w-full">
              <div className="glass-card px-4 py-4 border border-white/10">
                <p className="text-xl sm:text-2xl font-semibold text-white">11</p>
                <p className="text-[0.58rem] sm:text-[0.62rem] tracking-[0.24em] text-white/55 mt-1">TITLES</p>
              </div>
              <div className="glass-card px-4 py-4 border border-white/10">
                <p className="text-xl sm:text-2xl font-semibold text-white">1</p>
                <p className="text-[0.58rem] sm:text-[0.62rem] tracking-[0.24em] text-white/55 mt-1">CHAMPION</p>
              </div>
              <div className="glass-card px-4 py-4 border border-white/10">
                <p className="text-xl sm:text-2xl font-semibold text-white">LIVE</p>
                <p className="text-[0.58rem] sm:text-[0.62rem] tracking-[0.24em] text-white/55 mt-1">SEASON</p>
              </div>
            </div>
          </ScrollReveal>
          </div>
          <div className="mt-10 flex justify-center">
            <button
              className="text-white/55 hover:text-white transition-colors"
              onClick={() => document.getElementById("leaderboard")?.scrollIntoView({ behavior: "smooth" })}
              aria-label="Scroll to next section"
            >
              <ChevronRight className="rotate-90" size={24} />
            </button>
          </div>
      </motion.div>
    </section>
  );
}
