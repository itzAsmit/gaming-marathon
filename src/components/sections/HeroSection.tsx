import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionTemplate, useSpring } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  
  // 3D Tilt effect state
  const mouseX = useSpring(0, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 100 });

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    mouseX.set(x * 20); // max rotation
    mouseY.set(y * -20);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[100svh] md:min-h-screen flex items-center justify-center overflow-hidden perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div 
        className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(var(--gold-rgb),0.15)_0%,transparent_60%)] pointer-events-none"
        style={{
          opacity,
          scale: useTransform(scrollYProgress, [0, 1], [1, 1.5]),
          transformStyle: "preserve-3d"
        }}
      />
      
      <motion.div 
        className="relative z-10 text-center px-4 max-w-5xl mx-auto w-full"
        style={{ 
          y, 
          opacity,
          rotateX: mouseY,
          rotateY: mouseX,
          transformStyle: "preserve-3d"
        }}
      >
        <motion.div 
          style={{ transform: "translateZ(60px)", transformStyle: "preserve-3d" }}
          className="relative"
        >
          <ScrollReveal delay={0.1}>
            <p
              className="text-xs md:text-sm font-cinzel tracking-[0.8em] mb-6 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]"
              style={{ color: "hsl(var(--gold))", fontFamily: "Cinzel, serif" }}
            >
              THE ULTIMATE COMPETITION
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.25}>
            <h1
              className="text-6xl md:text-9xl font-cinzel font-black mb-4 leading-none relative"
              style={{ fontFamily: "Cinzel, serif", transformStyle: "preserve-3d" }}
            >
              <motion.span 
                className="gradient-text-cream block"
                style={{ transform: "translateZ(40px)", textShadow: "0 20px 40px rgba(0,0,0,0.8)" }}
              >
                GAMING
              </motion.span>
              <motion.span 
                className="gradient-text-gold block mt-2"
                style={{ transform: "translateZ(80px)", textShadow: "0 0 60px rgba(255,215,0,0.4)" }}
              >
                MARATHON
              </motion.span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="flex items-center justify-center gap-4 my-8" style={{ transform: "translateZ(30px)" }}>
              <div className="h-px flex-1 max-w-32 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />
              <span
                className="text-xs tracking-[0.5em] font-cinzel"
                style={{ color: "hsl(var(--cream-dark))", fontFamily: "Cinzel, serif" }}
              >
                ESPORTS CHAMPIONSHIP
              </span>
              <div className="h-px flex-1 max-w-32 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.55}>
            <p
              className="text-base md:text-xl font-inter font-light mb-12 max-w-2xl mx-auto leading-relaxed"
              style={{ color: "hsl(var(--cream) / 0.9)", transform: "translateZ(50px)", textShadow: "0 4px 10px rgba(0,0,0,0.5)" }}
            >
              11 games. 1 champion. The ultimate test of skill, strategy, and survival.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.7}>
            <div className="flex flex-col items-center gap-6 justify-center" style={{ transform: "translateZ(70px)" }}>
              {/* APPLY NOW - 3D Golden CTA */}
              <motion.button
                whileHover={{ scale: 1.05, translateZ: 20 }}
                whileTap={{ scale: 0.95 }}
                className="relative group px-14 py-5 font-cinzel text-sm tracking-[0.4em] rounded-full overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--gold)), #fff, hsl(var(--gold)))",
                  backgroundSize: "200% auto",
                  color: "hsl(var(--brown-deep))",
                  fontFamily: "Cinzel, serif",
                  boxShadow: "0 20px 40px -10px hsla(var(--gold) / 0.5), inset 0 2px 4px rgba(255,255,255,0.8)",
                  fontWeight: 800,
                  transformStyle: "preserve-3d"
                }}
                onClick={() => {}}
              >
                <div className="absolute inset-0 bg-white/20 group-hover:bg-white/40 transition-colors duration-300" />
                <span className="relative z-10 drop-shadow-md">APPLY NOW</span>
                
                {/* 3D edge effect */}
                <div className="absolute inset-0 border-b-4 border-[rgba(0,0,0,0.2)] rounded-full pointer-events-none" />
              </motion.button>
              
              {/* Social buttons row */}
              <div className="flex flex-row items-center gap-4 mt-4" style={{ transform: "translateZ(20px)" }}>
                <motion.button
                  whileHover={{ scale: 1.1, translateY: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 font-cinzel text-xs tracking-[0.3em] rounded-full glass-card relative overflow-hidden group border border-white/10"
                  style={{
                    color: "hsl(var(--cream))",
                    fontFamily: "Cinzel, serif",
                    boxShadow: "0 10px 30px -10px rgba(37,211,102,0.3)"
                  }}
                  onClick={() => {}}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#25D366]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="flex items-center gap-3 relative z-10">
                    <span className="w-2 h-2 rounded-full bg-[#25D366] shadow-[0_0_10px_#25D366]" />
                    JOIN WHATSAPP
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1, translateY: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 font-cinzel text-xs tracking-[0.3em] rounded-full glass-card relative overflow-hidden group border border-white/10"
                  style={{
                    color: "hsl(var(--cream))",
                    fontFamily: "Cinzel, serif",
                    boxShadow: "0 10px 30px -10px rgba(88,101,242,0.3)"
                  }}
                  onClick={() => window.open("https://discord.gg/VwW8ktwzyb", "_blank")}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5865F2]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="flex items-center gap-3 relative z-10">
                    <span className="w-2 h-2 rounded-full bg-[#5865F2] shadow-[0_0_10px_#5865F2]" />
                    JOIN DISCORD
                  </div>
                </motion.button>
              </div>
            </div>
          </ScrollReveal>
        </motion.div>
      </motion.div>

      {/* Decorative 3D corner pieces */}
      {[
        { top: "2rem", left: "2rem", rotate: "0deg" },
        { top: "2rem", right: "2rem", rotate: "90deg" },
        { bottom: "2rem", left: "2rem", rotate: "-90deg" },
        { bottom: "2rem", right: "2rem", rotate: "180deg" },
      ].map((pos, i) => (
        <motion.div 
          key={i}
          className="absolute w-24 h-24 opacity-40 pointer-events-none" 
          style={{ 
            ...pos,
            borderTop: "2px solid hsl(var(--gold))", 
            borderLeft: "2px solid hsl(var(--gold))",
            boxShadow: "inset 2px 2px 10px rgba(255,215,0,0.2)",
            y: useTransform(scrollYProgress, [0, 1], ["0%", i > 1 ? "-100%" : "100%"]),
          }} 
        />
      ))}
    </section>
  );
}
