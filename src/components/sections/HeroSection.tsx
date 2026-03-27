import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import MonolithThreeCanvas from "@/components/MonolithThreeCanvas";

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

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);

  return (
    <section ref={containerRef} className="relative min-h-[100svh] md:min-h-screen overflow-hidden" aria-label="Hero">
      <motion.div
        className="relative min-h-[100svh] md:min-h-screen"
        style={{ y }}
      >
        <div className="absolute inset-0 z-0 bg-white">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(#d4d4d4 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage: "radial-gradient(circle, black, transparent 80%)",
              WebkitMaskImage: "radial-gradient(circle, black, transparent 80%)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-[72vw] max-w-[620px] aspect-square border border-black/10 rounded-full flex items-center justify-center">
              <div className="absolute w-[82%] h-[82%] border border-black/10 rotate-45" />
              <div className="absolute w-[62%] h-[62%] border border-black/10 -rotate-12" />
              <div className="w-1/2 h-1/2 border-2 border-black/10 rounded-full blur-[2px]" />
            </div>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_30%,rgba(255,255,255,0.78)_100%)]" />
        </div>

        <nav className="relative z-20 w-full px-5 sm:px-8 lg:px-12 py-6 md:py-8 flex items-center justify-between border-b border-black/5 bg-white/80 backdrop-blur-md">
          <div className="text-base sm:text-xl font-black tracking-tight text-black">MONOLITH_MARATHON</div>

          <div className="hidden lg:flex items-center gap-8 text-[0.62rem] tracking-[0.19em] font-bold text-black/70">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
                className="uppercase hover:text-black transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-[0.62rem] tracking-[0.16em] font-bold">
            <button
              onClick={() => document.getElementById("players")?.scrollIntoView({ behavior: "smooth" })}
              className="hidden sm:inline uppercase text-black hover:opacity-70 transition-opacity"
            >
              REGISTER
            </button>
            <Link to="/admin/login" className="uppercase text-black hover:opacity-70 transition-opacity">
              ADMIN
            </Link>
          </div>
        </nav>

        <div className="relative z-10 min-h-[calc(100svh-88px)] md:min-h-[calc(100vh-110px)] flex items-center justify-center px-6 sm:px-10 lg:px-12 pt-10 pb-32 md:pb-36">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="w-[84vw] h-[54vh] max-w-[1100px] max-h-[620px] opacity-[0.2] md:opacity-[0.16] grayscale">
              <MonolithThreeCanvas />
            </div>
          </div>

          <div className="relative z-10 text-center max-w-6xl">
            <p className="text-3xl md:text-5xl leading-none tracking-tight text-black/80" style={{ fontFamily: "ROWAN, serif" }}>
              The
            </p>

            <h1 className="mt-1 text-5xl sm:text-7xl md:text-[112px] font-black leading-[0.86] tracking-[-0.03em] text-black uppercase" style={{ fontFamily: "Orbitron, sans-serif" }}>
              Gaming
              <br />
              Marathon
            </h1>

            <p className="mt-8 max-w-2xl mx-auto text-[0.68rem] sm:text-xs md:text-sm tracking-[0.23em] uppercase font-bold text-black/65 leading-relaxed">
              Architecting the future of elite competitive performance.
              <span className="text-black"> Est. 2024</span>
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="bg-black text-white px-10 py-4 font-black uppercase tracking-[0.2em] text-xs rounded-lg shadow-[0_14px_30px_rgba(0,0,0,0.12)] hover:bg-black/85 transition-colors"
                onClick={() => document.getElementById("players")?.scrollIntoView({ behavior: "smooth" })}
              >
                APPLY_TO_COMPETE
              </button>
              <button
                className="border-2 border-black text-black px-10 py-4 font-black uppercase tracking-[0.2em] text-xs rounded-lg hover:bg-black hover:text-white transition-colors"
                onClick={() => window.open("https://discord.gg/VwW8ktwzyb", "_blank")}
              >
                JOIN_DISCORD
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 md:bottom-12 left-0 w-full px-6 sm:px-10 lg:px-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 z-20 pointer-events-none">
          <div className="flex flex-col gap-1">
            <div className="text-[10px] tracking-[0.3em] font-black text-black/35 uppercase">Registration Status</div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-black font-bold tracking-tight uppercase text-sm">Phase 01 Active</span>
            </div>
          </div>

          <div className="flex gap-8 sm:gap-12 text-left md:text-right">
            <div>
              <div className="text-[10px] tracking-[0.3em] font-black text-black/35 uppercase">Prize Pool</div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-black">$250,000.00</div>
            </div>
            <div>
              <div className="text-[10px] tracking-[0.3em] font-black text-black/35 uppercase">Competitors</div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-black">12,480</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-30 flex justify-center">
          <button
            className="text-black/45 hover:text-black transition-colors"
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
