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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(75,95,130,0.22),transparent_45%),radial-gradient(circle_at_80%_75%,rgba(45,70,100,0.22),transparent_50%),linear-gradient(180deg,rgba(2,8,18,0.9),rgba(3,10,20,0.96))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />

      <motion.div
        className="relative z-10 w-[95%] max-w-[1500px] mx-auto min-h-[82vh] pt-20 sm:pt-24 pb-8 md:pb-10 flex flex-col justify-between"
        style={{ y, opacity }}
      >
        <img
          src="/assets/logo.png"
          alt="Gaming Marathon Logo"
          className="absolute -top-8 sm:-top-10 md:-top-12 left-1/2 -translate-x-1/2 z-30 h-14 sm:h-16 md:h-20 object-contain pointer-events-none"
        />

        <div className="relative w-full h-full flex flex-col flex-grow overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#081321]/75 backdrop-blur-sm shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: "url('/assets/banner.jpg')" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(4,11,20,0.84),rgba(5,13,24,0.66)_42%,rgba(3,10,20,0.84)_100%)]" />

          <div className="absolute -top-9 sm:-top-10 left-1/2 -translate-x-1/2 z-20 w-[210px] sm:w-[260px] h-10 sm:h-11 rounded-t-[1.25rem] border border-white/12 border-b-0 bg-[#060d17]/90 backdrop-blur-md" />

          {/* Top Navigation Row */}
          <div className="relative z-20 w-full px-6 sm:px-12 pt-8 sm:pt-10 pb-6 flex items-start justify-between">
            {/* Left Nav */}
            <div className="hidden lg:flex items-center gap-8 text-[0.55rem] tracking-[0.25em] font-semibold text-white/55">
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

            <div className="hidden lg:block w-[210px] sm:w-[260px]" aria-hidden="true" />

            {/* Right Nav */}
            <div className="hidden lg:flex items-center gap-8 text-[0.55rem] tracking-[0.25em] font-semibold text-white/55 ml-auto">
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

          <div className="relative z-10 flex-grow px-6 sm:px-12 lg:px-20 py-10 lg:py-14 flex flex-col justify-end">
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
