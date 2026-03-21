import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import { Trophy, Gamepad2, Users, ChevronRight } from "lucide-react";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[100svh] md:min-h-screen flex items-center overflow-hidden bg-[#0a0a0a]"
    >
      {/* Optimized Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,215,0,0.08)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-30" />
      
      <motion.div 
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0"
        style={{ y, opacity }}
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column: Text & CTA */}
          <div className="text-left space-y-8">
            <ScrollReveal delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-xs font-cinzel tracking-widest backdrop-blur-sm">
                <Trophy className="w-4 h-4" />
                <span>THE ULTIMATE COMPETITION</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-cinzel font-black leading-[1.1] tracking-tight">
                <span className="text-white drop-shadow-md">GAMING</span>
                <br />
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
                  MARATHON
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <p className="text-lg sm:text-xl font-inter font-light max-w-lg leading-relaxed text-gray-300">
                11 games. 1 champion. The ultimate test of skill, strategy, and survival. Prepare to prove yourself.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.55}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <button
                  className="px-8 py-4 font-cinzel text-sm tracking-[0.2em] rounded-lg relative overflow-hidden group bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold transition-all hover:shadow-[0_0_30px_-5px_rgba(234,179,8,0.5)] hover:scale-105"
                  onClick={() => {}}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    APPLY NOW <ChevronRight className="w-4 h-4" />
                  </span>
                </button>
                
                <div className="flex items-center gap-4">
                  <a
                    href="#"
                    className="p-3 rounded-full bg-white/5 border border-white/10 text-[#25D366] hover:bg-white/10 hover:border-[#25D366]/50 transition-colors"
                    title="Join WhatsApp"
                  >
                    <Users className="w-5 h-5" />
                  </a>
                  <a
                    href="https://discord.gg/VwW8ktwzyb"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-full bg-white/5 border border-white/10 text-[#5865F2] hover:bg-white/10 hover:border-[#5865F2]/50 transition-colors"
                    title="Join Discord"
                  >
                    <Gamepad2 className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Visual/Stats Elements */}
          <div className="hidden lg:flex justify-end">
            <ScrollReveal delay={0.5}>
              <div className="relative w-full max-w-md">
                {/* Glowing aesthetic blob behind stats */}
                <div className="absolute inset-0 bg-yellow-500/20 blur-[100px] rounded-full" />
                
                <div className="relative space-y-6">
                  {/* Stat Card 1 */}
                  <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 transform hover:-translate-y-1 transition-transform">
                    <div className="text-yellow-500 font-cinzel text-4xl font-bold mb-2">11</div>
                    <div className="text-gray-400 font-inter text-sm tracking-wider">COMPETITIVE TITLES</div>
                  </div>
                  
                  {/* Stat Card 2 */}
                  <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 transform translate-x-12 hover:-translate-y-1 transition-transform">
                    <div className="text-white font-cinzel text-4xl font-bold mb-2">1</div>
                    <div className="text-gray-400 font-inter text-sm tracking-wider">ULTIMATE CHAMPION</div>
                  </div>

                  {/* Stat Card 3 */}
                  <div className="bg-yellow-500/10 border border-yellow-500/30 backdrop-blur-md rounded-2xl p-6 transform hover:-translate-y-1 transition-transform">
                    <div className="text-yellow-400 font-cinzel text-xl font-bold mb-2">REGISTRATIONS OPEN</div>
                    <div className="text-yellow-500/80 font-inter text-sm tracking-wider">LIMITED SLOTS AVAILABLE</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
