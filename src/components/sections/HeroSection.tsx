import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const navItems = [
  { id: "leaderboard", label: "LEADERBOARD" },
  { id: "players", label: "PLAYERS" },
  { id: "games", label: "GAMES" },
  { id: "items", label: "ITEMS" },
  { id: "credits", label: "CREDITS" },
];

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
      className="relative min-h-[100svh] md:min-h-screen flex items-center overflow-hidden px-4 sm:px-6"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />

      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto py-8 md:py-10"
        style={{ y, opacity }}
      >
        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-black/38 backdrop-blur-md">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,12,20,0.35),rgba(6,12,20,0.55))]" />

          <div className="relative z-10 px-4 sm:px-8 lg:px-12 py-6 lg:py-8">
            <div className="relative mb-8 rounded-full border border-white/12 bg-black/30 px-3 sm:px-5 py-4">
              <div className="flex items-center justify-center gap-3 sm:gap-6 lg:gap-8 flex-wrap text-[0.55rem] sm:text-[0.62rem] tracking-[0.2em] font-semibold text-white/75">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 -top-9 w-16 h-16 rounded-full border border-white/20 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                <svg viewBox="0 0 64 64" className="w-10 h-10 text-white/85" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 10L32 32L52 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M12 54L32 32L52 54" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M22 20L32 32L42 20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M22 44L32 32L42 44" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                  <rect x="27.5" y="50" width="9" height="9" transform="rotate(45 27.5 50)" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>

              <Link
                to="/admin/login"
                className="absolute right-2 top-1/2 -translate-y-1/2 border border-white/30 px-3 py-1.5 text-[0.52rem] sm:text-[0.58rem] tracking-[0.2em] text-white/85 hover:bg-white/10 transition-colors"
              >
                ADMIN
              </Link>
            </div>

            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-8 items-end pt-6 lg:pt-8 pb-5">
              <div>
                <ScrollReveal delay={0.1}>
                  <p className="text-[0.6rem] sm:text-xs tracking-[0.28em] text-white/70 mb-3">
                    IF YOU DARE ENTER
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={0.2}>
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.97] text-white uppercase tracking-[0.03em]">
                    THE
                    <br />
                    GAMING
                    <br />
                    MARATHON
                  </h1>
                </ScrollReveal>

                <ScrollReveal delay={0.32}>
                  <div className="mt-7 flex flex-col sm:flex-row sm:flex-wrap items-start gap-3">
                    <button
                      className="px-8 py-3 text-[0.62rem] tracking-[0.24em] rounded-full font-semibold transition-all duration-300 hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-light)))",
                        color: "hsl(var(--brown-deep))",
                        boxShadow: "0 0 20px hsla(var(--gold) / 0.34)",
                      }}
                      onClick={() => document.getElementById("players")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      APPLY NOW
                    </button>

                    <button
                      className="px-7 py-3 text-[0.58rem] tracking-[0.22em] rounded-full glass-card transition-all duration-300 hover:scale-105 flex items-center gap-2 border border-white/10 relative overflow-hidden"
                      onClick={() => {}}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#25D366]/20 to-transparent opacity-80" />
                      <span className="relative z-10 w-2 h-2 rounded-full bg-[#25D366] shadow-[0_0_8px_#25D366]" />
                      <span className="relative z-10 text-white">JOIN WHATSAPP</span>
                    </button>

                    <button
                      className="px-7 py-3 text-[0.58rem] tracking-[0.22em] rounded-full glass-card transition-all duration-300 hover:scale-105 flex items-center gap-2 border border-white/10 relative overflow-hidden"
                      onClick={() => window.open("https://discord.gg/VwW8ktwzyb", "_blank")}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#5865F2]/20 to-transparent opacity-80" />
                      <span className="relative z-10 w-2 h-2 rounded-full bg-[#5865F2] shadow-[0_0_8px_#5865F2]" />
                      <span className="relative z-10 text-white">JOIN DISCORD</span>
                    </button>
                  </div>
                </ScrollReveal>
              </div>

              <div className="lg:pb-3">
                <ScrollReveal delay={0.26}>
                  <p className="text-[#f29f57] text-[0.62rem] tracking-[0.18em] font-semibold mb-3">
                    EXPERIENCE THE THRILL OF THE GAMING MARATHON
                  </p>
                  <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-md">
                    Welcome to the ultimate gaming showdown where strategy, speed, and focus collide. Step into a world of intense challenges,
                    high-stakes matches, and unforgettable moments. Every round can shift the leaderboard, and every decision can define the champion.
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={0.38}>
                  <div className="mt-6 grid grid-cols-3 gap-3 max-w-md">
                    <div className="rounded-xl border border-white/15 bg-black/35 px-3 py-3 text-center">
                      <p className="text-white text-xl font-semibold">11</p>
                      <p className="text-[0.58rem] tracking-[0.18em] text-white/60 mt-1">GAMES</p>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-black/35 px-3 py-3 text-center">
                      <p className="text-white text-xl font-semibold">1</p>
                      <p className="text-[0.58rem] tracking-[0.18em] text-white/60 mt-1">CHAMPION</p>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-black/35 px-3 py-3 text-center">
                      <p className="text-white text-xl font-semibold">LIVE</p>
                      <p className="text-[0.58rem] tracking-[0.18em] text-white/60 mt-1">SEASON</p>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
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
