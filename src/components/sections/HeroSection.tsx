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
        className="relative z-10 w-[95%] max-w-[1600px] mx-auto min-h-[85vh] py-8 md:py-10 flex flex-col justify-between"
        style={{ y, opacity }}
      >
        <div className="relative w-full h-full flex flex-col flex-grow overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-md">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.3),rgba(10,20,30,0.6))]" />

          {/* Top Navigation Row */}
          <div className="relative z-20 w-full px-6 sm:px-12 pt-8 sm:pt-12 pb-6 flex items-start justify-between">
            {/* Left Nav */}
            <div className="hidden lg:flex items-center gap-8 text-[0.62rem] tracking-[0.2em] font-semibold text-white/60">
              {navItems.slice(0, 2).map((item) => (
                <button
                  key={item.id}
                  onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
                  className="hover:text-white transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Center Cutout & Logo Placeholder */}
            {/* Using absolute positioning to break out of flex constraints to stay perfectly centered */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[220px] md:w-[320px] h-16 sm:h-20 bg-black/50 border-b border-white/10 rounded-b-[2rem] flex items-center justify-center backdrop-blur-xl">
               <img src="/assets/logo.png" alt="Gaming Marathon Logo" className="mt-2 h-10 sm:h-14 object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
            </div>

            {/* Right Nav */}
            <div className="hidden lg:flex items-center gap-8 text-[0.62rem] tracking-[0.2em] font-semibold text-white/60 ml-auto">
              {navItems.slice(2, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
                  className="hover:text-white transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Link
                to="/admin/login"
                className="hover:text-white transition-colors"
              >
                ADMIN
              </Link>
            </div>
            
            {/* Mobile Nav Toggle Setup (optional fallback) */}
            <div className="lg:hidden ml-auto">
               <button className="text-white/60 hover:text-white text-xs tracking-wider font-semibold">MENU</button>
            </div>
          </div>

          <div className="relative z-10 flex-grow px-6 sm:px-12 lg:px-20 py-10 lg:py-16 flex flex-col justify-end">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-end">
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
                      className="px-8 py-3.5 text-[0.65rem] tracking-[0.2em] rounded-full font-bold transition-all duration-300 hover:scale-105 bg-[#d96c2c] text-black"
                      onClick={() => document.getElementById("players")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      APPLY NOW
                    </button>

                    <button
                      className="px-8 py-3.5 text-[0.65rem] tracking-[0.2em] rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-2 border border-white/40 text-white hover:bg-white/10"
                      onClick={() => {}}
                    >
                      <span className="relative z-10">JOIN WHATSAPP</span>
                    </button>

                    <button
                      className="px-8 py-3.5 text-[0.65rem] tracking-[0.2em] rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-2 border border-white/40 text-white hover:bg-white/10"
                      onClick={() => window.open("https://discord.gg/VwW8ktwzyb", "_blank")}
                    >
                      <span className="relative z-10">JOIN DISCORD</span>
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
