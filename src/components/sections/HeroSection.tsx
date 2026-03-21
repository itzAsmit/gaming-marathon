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
      className="relative min-h-[100svh] md:min-h-screen flex items-center overflow-hidden px-4 sm:px-6 py-6 md:py-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(111,133,126,0.24),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(70,94,92,0.22),transparent_40%),linear-gradient(180deg,rgba(5,10,12,0.82),rgba(7,12,15,0.88))]" />

      <motion.div
        className="relative z-10 w-[95%] max-w-[1400px] mx-auto min-h-[82vh] py-4 md:py-6 flex flex-col justify-between"
        style={{ y, opacity }}
      >
        <div
          className="relative w-full h-full flex flex-col flex-grow overflow-hidden rounded-[2rem] border border-white/10 backdrop-blur-md"
          style={{
            background:
              "linear-gradient(140deg, rgba(16,25,30,0.82), rgba(8,14,18,0.9))",
            boxShadow: "0 18px 60px rgba(0, 0, 0, 0.35)",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(164,191,180,0.18),transparent_38%),linear-gradient(180deg,rgba(0,0,0,0.34),rgba(0,0,0,0.5))]" />

          {/* Top Navigation Row */}
          <div className="relative z-20 w-full px-6 sm:px-10 lg:px-12 pt-7 sm:pt-8 pb-4 flex items-start justify-between">
            {/* Left Nav */}
            <div className="hidden lg:flex items-center gap-7 text-[0.6rem] tracking-[0.22em] font-semibold text-white/60">
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
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[190px] md:w-[240px] h-14 sm:h-16 bg-black/35 border-b border-white/10 rounded-b-[1.35rem] flex items-center justify-center backdrop-blur-xl">
               <img src="/assets/logo.png" alt="Gaming Marathon Logo" className="mt-1 h-8 sm:h-10 object-contain opacity-90" />
            </div>

            {/* Right Nav */}
            <div className="hidden lg:flex items-center gap-7 text-[0.6rem] tracking-[0.22em] font-semibold text-white/60 ml-auto">
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

          <div className="relative z-10 flex-grow px-6 sm:px-10 lg:px-16 py-10 lg:py-14 flex flex-col justify-end">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-end">
              <div>
                <ScrollReveal delay={0.1}>
                  <p className="text-[0.58rem] sm:text-[0.63rem] tracking-[0.27em] text-white/70 mb-3">
                    IF YOU DARE ENTER
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={0.2}>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.95] text-white uppercase tracking-[0.01em]">
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
                      className="px-8 py-3 text-[0.64rem] tracking-[0.18em] rounded-full font-bold transition-all duration-300 hover:scale-105 bg-[#df7a35] text-black"
                      onClick={() => document.getElementById("players")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      APPLY NOW
                    </button>

                    <button
                      className="px-8 py-3 text-[0.64rem] tracking-[0.18em] rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-2 border border-white/55 text-white hover:bg-white/10"
                      onClick={() => {}}
                    >
                      <span className="relative z-10">JOIN WHATSAPP</span>
                    </button>

                    <button
                      className="px-8 py-3 text-[0.64rem] tracking-[0.18em] rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-2 border border-white/55 text-white hover:bg-white/10"
                      onClick={() => window.open("https://discord.gg/VwW8ktwzyb", "_blank")}
                    >
                      <span className="relative z-10">JOIN DISCORD</span>
                    </button>
                  </div>
                </ScrollReveal>
              </div>

              <div className="lg:pb-3">
                <ScrollReveal delay={0.26}>
                  <p className="text-[#f29f57] text-[0.6rem] tracking-[0.18em] font-semibold mb-3">
                    EXPERIENCE THE THRILL OF THE GAMING MARATHON
                  </p>
                  <p className="text-white/78 text-sm sm:text-[0.98rem] leading-relaxed max-w-md">
                    Welcome to the ultimate gaming showdown where strategy, speed, and focus collide. Step into a world of intense challenges,
                    high-stakes matches, and unforgettable moments. Every round can shift the leaderboard, and every decision can define the champion.
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={0.38}>
                  <div className="mt-6 grid grid-cols-3 gap-3 max-w-md">
                    <div className="rounded-xl border border-white/20 bg-black/30 px-3 py-3 text-center">
                      <p className="text-white text-xl font-semibold">11</p>
                      <p className="text-[0.58rem] tracking-[0.18em] text-white/60 mt-1">GAMES</p>
                    </div>
                    <div className="rounded-xl border border-white/20 bg-black/30 px-3 py-3 text-center">
                      <p className="text-white text-xl font-semibold">1</p>
                      <p className="text-[0.58rem] tracking-[0.18em] text-white/60 mt-1">CHAMPION</p>
                    </div>
                    <div className="rounded-xl border border-white/20 bg-black/30 px-3 py-3 text-center">
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
