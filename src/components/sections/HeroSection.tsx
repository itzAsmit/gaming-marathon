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

  return (
    <section
      ref={containerRef}
      className="relative h-[100svh] md:h-screen flex items-start overflow-visible px-2 sm:px-3 pt-1 sm:pt-2"
    >
      <motion.div
        className="relative z-10 w-[98%] sm:w-[98%] max-w-[1800px] mx-auto h-full min-h-0 pt-5 sm:pt-6 pb-3 sm:pb-4 flex flex-col"
        style={{ y }}
      >
        <img
          src="/assets/logo.png"
          alt="Gaming Marathon Logo"
          className="absolute top-7 sm:top-7 md:top-8 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 h-11 sm:h-12 md:h-14 object-contain pointer-events-none drop-shadow-[0_0_10px_rgba(255,255,255,0.08)]"
        />

        <div 
          className="relative w-full h-full min-h-0 flex flex-col flex-grow rounded-[2.8rem] shadow-[0_20px_70px_rgba(0,0,0,0.45)]"
          style={{
            WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 82'%3E%3Cpath d='M0 0 L 90 0 C 118 0 130 8 142 24 L 156 42 C 164 52 170 56 182 56 L 218 56 C 230 56 236 52 244 42 L 258 24 C 270 8 282 0 310 0 L 400 0 L 400 82 L 0 82 Z' fill='black'/%3E%3C/svg%3E"), linear-gradient(black, black), linear-gradient(black, black), linear-gradient(black, black)`,
            WebkitMaskPosition: "top center, top left, top right, 0 81px",
            WebkitMaskRepeat: "no-repeat, no-repeat, no-repeat, no-repeat",
            WebkitMaskSize: "400px 82px, calc(50% - 199px) 82px, calc(50% - 199px) 82px, 100% calc(100% - 81px)",
            maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 82'%3E%3Cpath d='M0 0 L 90 0 C 118 0 130 8 142 24 L 156 42 C 164 52 170 56 182 56 L 218 56 C 230 56 236 52 244 42 L 258 24 C 270 8 282 0 310 0 L 400 0 L 400 82 L 0 82 Z' fill='black'/%3E%3C/svg%3E"), linear-gradient(black, black), linear-gradient(black, black), linear-gradient(black, black)`,
            maskPosition: "top center, top left, top right, 0 81px",
            maskRepeat: "no-repeat, no-repeat, no-repeat, no-repeat",
            maskSize: "400px 82px, calc(50% - 199px) 82px, calc(50% - 199px) 82px, 100% calc(100% - 81px)"
          }}
        >
          
          {/* Main Panel Background */}
          <div className="absolute inset-0 overflow-hidden rounded-[2.8rem] border border-white/10 backdrop-blur-sm">
            <div
              className="absolute inset-0 bg-center bg-cover"
              style={{ backgroundImage: "url('/assets/banner.jpg')" }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(4,11,20,0.84),rgba(5,13,24,0.66)_42%,rgba(3,10,20,0.84)_100%)]" />
          </div>

          <svg 
            className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            width="400" 
            height="82" 
            viewBox="0 0 400 82" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path 
              d="M90 0.5 C 118 0.5 130 8.5 142 24.5 L 156 42.5 C 164 52.5 170 56.5 182 56.5 L 218 56.5 C 230 56.5 236 52.5 244 42.5 L 258 24.5 C 270 8.5 282 0.5 310 0.5" 
              stroke="rgba(255, 255, 255, 0.1)" 
              strokeWidth="1"
            />
          </svg>

          {/* Top Navigation Row */}
          <div className="relative z-20 w-full px-6 sm:px-12 pt-8 sm:pt-9 pb-6 flex items-center justify-between">
            {/* Left Nav */}
            <div className="hidden lg:flex w-[40%] items-center gap-8 text-[0.55rem] tracking-[0.25em] font-semibold text-white/55">
              {navItems.slice(0, 2).map((item) => (
                <button
                  key={item.id}
                  onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
                  className="hover:text-white/90 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="hidden lg:block w-[220px] shrink-0" aria-hidden="true" />

            {/* Right Nav */}
            <div className="hidden lg:flex w-[40%] items-center justify-end gap-8 text-[0.55rem] tracking-[0.25em] font-semibold text-white/55">
              {navItems.slice(2, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
                  className="hover:text-white/90 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Link
                to="/admin/login"
                className="hover:text-white/90 transition-colors"
              >
                ADMIN
              </Link>
            </div>
            
            {/* Mobile Nav Toggle Setup (optional fallback) */}
            <div className="lg:hidden ml-auto">
               <button className="text-white/60 hover:text-white text-xs tracking-wider font-semibold">MENU</button>
            </div>
          </div>

          <div className="relative z-10 flex-grow px-6 sm:px-12 lg:px-20 py-[120px] lg:py-[140px] flex flex-col justify-end">
            <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-24 items-end">
              <div>
                <ScrollReveal delay={0.1}>
                  <p className="text-[0.56rem] sm:text-[0.62rem] tracking-[0.35em] text-white/60 mb-5 font-medium">
                    IF YOU DARE ENTER
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={0.2}>
                  <h1
                    className="text-[2.7rem] sm:text-[4.3rem] lg:text-[5.4rem] font-black leading-[0.92] text-white uppercase tracking-[0.02em]"
                    style={{ fontFamily: "Orbitron, sans-serif" }}
                  >
                    THE
                    <br />
                    GAMING
                    <br />
                    MARATHON
                  </h1>
                </ScrollReveal>

                <ScrollReveal delay={0.32}>
                  <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap items-start gap-3">
                    <button
                      className="px-8 py-3.5 text-[0.58rem] tracking-[0.22em] rounded-full font-bold transition-all duration-300 hover:scale-105 bg-[#d96c2c] text-black"
                      onClick={() => document.getElementById("players")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      APPLY NOW
                    </button>

                    <button
                      className="px-8 py-3.5 text-[0.58rem] tracking-[0.22em] rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-2 border border-white/45 text-white/95 hover:bg-white/10"
                      onClick={() => {}}
                    >
                      <span className="relative z-10">JOIN WHATSAPP</span>
                    </button>

                    <button
                      className="px-8 py-3.5 text-[0.58rem] tracking-[0.22em] rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-2 border border-white/45 text-white/95 hover:bg-white/10"
                      onClick={() => window.open("https://discord.gg/VwW8ktwzyb", "_blank")}
                    >
                      <span className="relative z-10">JOIN DISCORD</span>
                    </button>
                  </div>
                </ScrollReveal>
              </div>

              <div className="lg:pb-3 lg:pl-3">
                <ScrollReveal delay={0.26}>
                  <p className="text-[#f29f57] text-[0.56rem] tracking-[0.24em] font-semibold mb-3">
                    EXPERIENCE THE THRILL OF THE GAMING MARATHON
                  </p>
                  <p className="text-white/74 text-sm sm:text-[0.98rem] leading-relaxed max-w-[34rem]">
                    Welcome to the ultimate gaming showdown where strategy, speed, and focus collide. Step into a world of intense challenges,
                    high-stakes matches, and unforgettable moments. Every round can shift the leaderboard, and every decision can define the champion.
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={0.38}>
                  <div className="mt-7 grid grid-cols-3 gap-3 max-w-[34rem]">
                    <div className="rounded-xl border border-white/20 bg-[#0a1626]/70 px-3 py-3 text-center">
                      <p className="text-white text-lg sm:text-xl font-semibold">11</p>
                      <p className="text-[0.52rem] tracking-[0.24em] text-white/60 mt-1">GAMES</p>
                    </div>
                    <div className="rounded-xl border border-white/20 bg-[#0a1626]/70 px-3 py-3 text-center">
                      <p className="text-white text-lg sm:text-xl font-semibold">1</p>
                      <p className="text-[0.52rem] tracking-[0.24em] text-white/60 mt-1">CHAMPION</p>
                    </div>
                    <div className="rounded-xl border border-white/20 bg-[#0a1626]/70 px-3 py-3 text-center">
                      <p className="text-white text-lg sm:text-xl font-semibold">LIVE</p>
                      <p className="text-[0.52rem] tracking-[0.24em] text-white/60 mt-1">SEASON</p>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>

          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex justify-center">
            <button
              className="text-white/55 hover:text-white transition-colors"
              onClick={() => document.getElementById("leaderboard")?.scrollIntoView({ behavior: "smooth" })}
              aria-label="Scroll to next section"
            >
              <ChevronRight className="rotate-90" size={24} />
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
