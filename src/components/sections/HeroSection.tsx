import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <ScrollReveal delay={0.1}>
          <p
            className="text-xs md:text-sm font-cinzel tracking-[0.6em] mb-6"
            style={{ color: "hsl(var(--gold))", fontFamily: "Cinzel, serif" }}
          >
            THE ULTIMATE COMPETITION
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <h1
            className="text-6xl md:text-9xl font-cinzel font-black mb-4 leading-none"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            <span className="gradient-text-cream text-glow-cream block">GAMING</span>
            <span className="gradient-text-gold text-glow-gold block">MARATHON</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="flex items-center justify-center gap-4 my-6">
            <div className="h-px flex-1 max-w-32" style={{ background: "linear-gradient(to right, transparent, hsl(var(--gold)))" }} />
            <span
              className="text-xs tracking-[0.5em] font-cinzel"
              style={{ color: "hsl(var(--cream-dark))", fontFamily: "Cinzel, serif" }}
            >
              ESPORTS CHAMPIONSHIP
            </span>
            <div className="h-px flex-1 max-w-32" style={{ background: "linear-gradient(to left, transparent, hsl(var(--gold)))" }} />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.55}>
          <p
            className="text-base md:text-lg font-inter font-light mb-10 max-w-xl mx-auto leading-relaxed"
            style={{ color: "hsl(var(--cream) / 0.8)" }}
          >
            11 games. 1 champion. The ultimate test of skill, strategy, and survival.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.7}>
          <div className="flex flex-col items-center gap-4 justify-center">
            {/* APPLY NOW - primary golden CTA */}
            <button
              className="px-12 py-4 font-cinzel text-sm tracking-[0.4em] rounded-full transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-light)))",
                color: "hsl(var(--brown-deep))",
                fontFamily: "Cinzel, serif",
                boxShadow: "0 0 40px hsla(var(--gold) / 0.5), 0 0 80px hsla(var(--gold) / 0.2)",
                fontWeight: 700,
              }}
              onClick={() => {}}
            >
              APPLY NOW
            </button>

            {/* Scroll indicator below APPLY NOW */}
            <motion.div
              className="flex flex-col items-center gap-1"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              <p className="text-xs tracking-[0.4em] font-cinzel" style={{ color: "hsl(var(--gold) / 0.7)", fontFamily: "Cinzel, serif" }}>
                SCROLL
              </p>
            </motion.div>

            {/* Social buttons row with gold line divider between them */}
            <div className="flex flex-row items-center gap-0">
              <button
                className="px-7 py-3 font-cinzel text-xs tracking-[0.3em] rounded-full glass-card transition-all duration-300 hover:scale-105 flex items-center gap-2"
                style={{
                  color: "hsl(var(--cream))",
                  fontFamily: "Cinzel, serif",
                  borderLeft: "2px solid #25D366",
                }}
                onClick={() => {}}
              >
                <span style={{ color: "#25D366", fontSize: "16px" }}>●</span>
                JOIN WHATSAPP
              </button>

              {/* Gold vertical line between buttons */}
              <div className="w-px h-10 mx-3" style={{ background: "linear-gradient(to bottom, transparent, hsl(var(--gold)), transparent)" }} />

              <button
                className="px-7 py-3 font-cinzel text-xs tracking-[0.3em] rounded-full glass-card transition-all duration-300 hover:scale-105 flex items-center gap-2"
                style={{
                  color: "hsl(var(--cream))",
                  fontFamily: "Cinzel, serif",
                  borderLeft: "2px solid #5865F2",
                }}
                onClick={() => {}}
              >
                <span style={{ color: "#5865F2", fontSize: "16px" }}>●</span>
                JOIN DISCORD
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Decorative corner pieces */}
      <div className="absolute top-8 left-8 w-16 h-16 opacity-30" style={{ borderTop: "1px solid hsl(var(--gold))", borderLeft: "1px solid hsl(var(--gold))" }} />
      <div className="absolute top-8 right-8 w-16 h-16 opacity-30" style={{ borderTop: "1px solid hsl(var(--gold))", borderRight: "1px solid hsl(var(--gold))" }} />
      <div className="absolute bottom-8 left-8 w-16 h-16 opacity-30" style={{ borderBottom: "1px solid hsl(var(--gold))", borderLeft: "1px solid hsl(var(--gold))" }} />
      <div className="absolute bottom-8 right-8 w-16 h-16 opacity-30" style={{ borderBottom: "1px solid hsl(var(--gold))", borderRight: "1px solid hsl(var(--gold))" }} />
    </section>
  );
}
